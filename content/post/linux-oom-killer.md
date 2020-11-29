+++
date = 2020-11-28T16:00:00Z
draft = true
title = "对于Linux中oom-killer的简单探究"
url = "/post/oom-killer"

+++
最近在对Elasticsearch集群进行压力测试的时候发现，当我不停的对集群进行创建索引操作时，集群的master节点总会莫名其妙的挂掉。表现是ES进程退出，并且JVM没有生成相应的dump文件。我陷入了疑惑，后来经过别人指点我才知道原来进程是被Linux中的oom-killer杀掉了。由于之前没有了解过，所以我花了一段时间了解了一下oom-killer的机制，还顺带看了一些Linux源码。

### 一、Linux内存分配参数vm.overcommit_memory

Linux的内存是先申请，然后再按需分配的，所以有可能一个进程申请了200MB的内存，但是实际只使用了100MB。所以为了最大化内存利用率，Linux支持过度申请，也就是所谓的overcommit。Linux内核通过overcommit_memory这个参数决定对待申请内存的策略，包含三个值，[内核文档](https://www.kernel.org/doc/Documentation/vm/overcommit-accounting)说明如下：

    0	-	Heuristic overcommit handling. Obvious overcommits of
    		address space are refused. Used for a typical system. It
    		ensures a seriously wild allocation fails while allowing
    		overcommit to reduce swap usage.  root is allowed to 
    		allocate slightly more memory in this mode. This is the 
    		default.
    
    1	-	Always overcommit. Appropriate for some scientific
    		applications. Classic example is code using sparse arrays
    		and just relying on the virtual memory consisting almost
    		entirely of zero pages.
    
    2	-	Don't overcommit. The total address space commit
    		for the system is not permitted to exceed swap + a
    		configurable amount (default is 50%) of physical RAM.
    		Depending on the amount you use, in most situations
    		this means a process will not be killed while accessing
    		pages but will receive errors on memory allocation as
    		appropriate.
    
    		Useful for applications that want to guarantee their
    		memory allocations will be available in the future
    		without having to initialize every page.

大概意思是：当值为0时会使用一种启发式的处理方式，明显超出限度的内存申请会被拒绝；当值为1时总是允许overcommit；当值为2时不允许overcommit，但实际上还是有个计算标准来决定是否拒绝内存申请。

说实话这些说明看起来很模糊，让人理解不能，但是当我找到相对应的内核源码时，我很轻松地就搞懂了这里面的逻辑，实际上很简单，我会用注释的方式说明。

代码如下：

    /*
     * Check that a process has enough memory to allocate a new virtual
     * mapping. 0 means there is enough memory for the allocation to
     * succeed and -ENOMEM implies there is not.
     *
     * We currently support three overcommit policies, which are set via the
     * vm.overcommit_memory sysctl.  See Documentation/vm/overcommit-accounting.rst
     *
     * Strict overcommit modes added 2002 Feb 26 by Alan Cox.
     * Additional code 2002 Jul 20 by Robert Love.
     *
     * cap_sys_admin is 1 if the process has admin privileges, 0 otherwise.
     *
     * Note this is a helper function intended to be used by LSMs which
     * wish to use this logic.
     */
    int __vm_enough_memory(struct mm_struct *mm, long pages, int cap_sys_admin)
    {
    	long allowed;
    
    	vm_acct_memory(pages); // 此处应该是申请内存逻辑
    
    	/*
    	 * Sometimes we want to use more memory than we have
    	 */
    	if (sysctl_overcommit_memory == OVERCOMMIT_ALWAYS) // OVERCOMMIT_ALWAYS对应上面的1
    		return 0; // 当逻辑是OVERCOMMIT_ALWAYS，总是返回0，也就是成功申请
    
    	if (sysctl_overcommit_memory == OVERCOMMIT_GUESS) { // OVERCOMMIT_GUESS对应上面的0
    		if (pages > totalram_pages() + total_swap_pages)
    			goto error; // 这里就是上面说的明显超出限度的内存申请，其实就是总内存加上swap内存
    		return 0;
    	}
    
    	allowed = vm_commit_limit(); // 这里实际上通过复杂一些的方式计算出来了一个限额，对应了NEVER的情况
    	/*
    	 * Reserve some for root
    	 */
    	if (!cap_sys_admin)
    		allowed -= sysctl_admin_reserve_kbytes >> (PAGE_SHIFT - 10);
    
    	/*
    	 * Don't let a single process grow so big a user can't recover
    	 */
    	if (mm) {
    		long reserve = sysctl_user_reserve_kbytes >> (PAGE_SHIFT - 10);
    
    		allowed -= min_t(long, mm->total_vm / 32, reserve);
    	}
    
    	if (percpu_counter_read_positive(&vm_committed_as) < allowed)
    		return 0;
    error:
    	vm_unacct_memory(pages); // 0和2的情况如果超出了相应的限度会到这里来，逻辑应该是释放申请的内存
    
    	return -ENOMEM;
    }

实际上能看出来是否触发oom killer跟这个参数根本没有关系，修改这个参数只会影响一个进程能否申请到内存的逻辑。值为1条件最宽松，值为0条件次之，值为2最严格，仅此而已。我之前被网上的一些信息误导了，让我以为这个参数与oom killer的执行逻辑有关，直到我读了一下代码才明白其中缘由。

那么是什么来决定oom killer的逻辑呢？这就涉及到另一个内核参数了。

### 二、Linux OOM处理逻辑参数vm.panic_on_oom

当实际物理内存不足时，会进入以下逻辑进行处理（oom_kill.c）：

    /**
     * out_of_memory - kill the "best" process when we run out of memory
     * @oc: pointer to struct oom_control
     *
     * If we run out of memory, we have the choice between either
     * killing a random task (bad), letting the system crash (worse)
     * OR try to be smart about which process to kill. Note that we
     * don't have to be perfect here, we just have to be good.
     */
    bool out_of_memory(struct oom_control *oc)
    {
    	unsigned long freed = 0;
    
    	if (oom_killer_disabled)
    		return false;
    
    	if (!is_memcg_oom(oc)) {
    		blocking_notifier_call_chain(&oom_notify_list, 0, &freed);
    		if (freed > 0)
    			/* Got some memory back in the last second. */
    			return true;
    	}
    
    	/*
    	 * If current has a pending SIGKILL or is exiting, then automatically
    	 * select it.  The goal is to allow it to allocate so that it may
    	 * quickly exit and free its memory.
    	 */
    	if (task_will_free_mem(current)) {
    		mark_oom_victim(current);
    		wake_oom_reaper(current);
    		return true;
    	}
    
    	/*
    	 * The OOM killer does not compensate for IO-less reclaim.
    	 * pagefault_out_of_memory lost its gfp context so we have to
    	 * make sure exclude 0 mask - all other users should have at least
    	 * ___GFP_DIRECT_RECLAIM to get here. But mem_cgroup_oom() has to
    	 * invoke the OOM killer even if it is a GFP_NOFS allocation.
    	 */
    	if (oc->gfp_mask && !(oc->gfp_mask & __GFP_FS) && !is_memcg_oom(oc))
    		return true;
    
    	/*
    	 * Check if there were limitations on the allocation (only relevant for
    	 * NUMA and memcg) that may require different handling.
    	 */
    	oc->constraint = constrained_alloc(oc);
    	if (oc->constraint != CONSTRAINT_MEMORY_POLICY)
    		oc->nodemask = NULL;
    	check_panic_on_oom(oc);
    
    	if (!is_memcg_oom(oc) && sysctl_oom_kill_allocating_task &&
    	    current->mm && !oom_unkillable_task(current) &&
    	    oom_cpuset_eligible(current, oc) &&
    	    current->signal->oom_score_adj != OOM_SCORE_ADJ_MIN) {
    		get_task_struct(current);
    		oc->chosen = current;
    		oom_kill_process(oc, "Out of memory (oom_kill_allocating_task)");
    		return true;
    	}
    
    	select_bad_process(oc);
    	/* Found nothing?!?! */
    	if (!oc->chosen) {
    		dump_header(oc, NULL);
    		pr_warn("Out of memory and no killable processes...\n");
    		/*
    		 * If we got here due to an actual allocation at the
    		 * system level, we cannot survive this and will enter
    		 * an endless loop in the allocator. Bail out now.
    		 */
    		if (!is_sysrq_oom(oc) && !is_memcg_oom(oc))
    			panic("System is deadlocked on memory\n");
    	}
    	if (oc->chosen && oc->chosen != (void *)-1UL)
    		oom_kill_process(oc, !is_memcg_oom(oc) ? "Out of memory" :
    				 "Memory cgroup out of memory");
    	return !!oc->chosen;
    }

其中方法注释写的很有意思：实际上当物理内存不足要发生时，对于操作系统来说没什么选择，要么随机杀进程(bad)，要么让系统崩溃(worse)，要么通过一种更聪明的方式杀进程释放出内存。在这时没有完美的(perfect)选择，只有好的(good)选择。的确，在一般情况下，杀进程确实要比让系统崩溃更好，这也是一种无奈的办法了。

当然，操作系统不会帮用户决定这种重要的事情，vm.panic_on_