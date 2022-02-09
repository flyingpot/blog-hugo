+++
categories = []
date = 2022-02-08T16:00:00Z
draft = true
tags = ["数据库"]
title = "为什么不要在数据库系统中使用MMAP？"
url = "/post/mmap-is-shit-in-dbms"

+++
数据库大神Andy Pavlo一直坚持着一个观点：不要在数据库系统中使用MMAP，对于这个观点我不是太理解。最近闲逛数据库大神Andy Pavlo的twitter时发现，他和他的学生竟然发了一篇论文来论证这个结论，这我不得抓紧拜读一下。

论文不长，并且比较好理解。本文就基于这篇论文写一下论文笔记，加深自己理解的同时也可以方便读者。

## 问题引出

作者引出了两种数据库系统中对于文件I/O管理的选择：

* 开发者自己实现buffer pool来管理文件I/O读入内存的数据
* 使用Linux操作系统实现的MMAP系统调用将文件直接映射到用户地址空间，并且利用对开发者透明的page cache来实现页面的换入换出

由于第二种方案，开发者不需要手动管理内存，实现起来简单，因此很多数据库系统曾经使用MMAP来代替buffer pool，但是由于一些问题导致它们最终弃用了MMAP（这一点也是论文的一个重要的论据），改为自己管理文件I/O。

本论文通过理论的引入和实验的结论证明MMAP不适合用在数据库系统中。

## 理论介绍

论文首先介绍了程序是如何通过MMAP系统调用访问到文件，结合着配图，原理十分清晰。

![](/images/mmap.png)

1. 程序调用MMAP返回了指向文件内容的指针
2. 操作系统保留了一部分虚拟地址空间，但是并没有开始加载文件
3. 程序开始使用指针获取文件的内容
4. 操作系统尝试在物理内存获取内存页
5. 由于内存页此时不存在，因此触发了页错误，开始从物理存储将第3步获取的那部分内容加载到物理内存页中
6. 操作系统将虚拟地址映射到物理地址的页表项（Page Table Entry）加入到页表中
7. 上述操作使用的CPU核心会将页表项加载到页表缓存（TLB）中

然后介绍了MMAP和其相关的几个API

* mmap:介绍了MAP_SHARED和MAP_PRIVATE在可见性上的区别
* madvise:介绍了MADV_NORMAL，MADV_RANDOM和MADV_SEQUENTIAL在预读上的区别
* mlock:可以尝试性的锁住内存中的页面，一定程度上防止被写回存储。（然而并不是确定性的锁住）
* msync:将页面从内存写回存储的接口

论文列举了几种曾经使用过MMAP但最终启用的数据库例子：

![](/images/mmap-based-dbms.png)

## 问题陈述

论文列举了三点关于使用MMAP可能引起的问题：

### 问题一 事务安全

由于MMAP中页面写回存储的时机不受程序控制，因此当commit还没有发生时，可能会有一部分脏页面已经写回存储了。此时原子性就会失效，在过程中的查询会看到中间状态。

为了解决事务安全问题，有以下三个解决方式：

- 操作系统写时复制（copy-on-write）：使用MAP_PRIVATE标识位创建一个独立的写空间（物理内存复制），写操作在这个写空间执行，读操作仍读取原来的空间。同时使用WAL（write-ahead log）来保证写入操作被持久化。事务提交之后将写空间新增的内容复制到读空间。

> 这里存在一个疑问，原文是这样表述的：
When a transaction
commits, the DBMS flushes the corresponding WAL records to
secondary storage and uses a separate background thread to apply
the committed changes to the primary copy.
我的理解是：持久化的不应该是WAL的记录，而应该是写空间的msync，只有msync意外中断的时候，才需要从WAL恢复。
作者应该理解没问题，可能只是表述的问题。也可能是我理解错了。

- 用户空间写时复制（copy-on-write）：类似操作系统写时复制，不过写空间在用户空间开辟，同样写入WAL保证持久性。事务提交后，从用户空间写回读空间。

> 这里提到了：
Since copying an entire page is wasteful
for small changes, some DBMSs support applying WAL records
directly to the mmap-backed memory.
特殊提到了一些数据库支持WAL直接写入，说明不是大多数数据库的行为，也验证了上面疑问中我的理解应该是对的。

- 影子分页：

## 实验说明

## 总结

经过几个小时的研读和理解，我