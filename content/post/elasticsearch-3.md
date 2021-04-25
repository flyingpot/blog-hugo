+++
categories = []
date = 2021-04-18T16:00:00Z
draft = true
tags = ["Elasticsearch", "Java"]
title = "Elasticsearch源码解析——线程池（一）"
url = "/post/elasticsearch-threadpool1"

+++
### 一、前言

现在，由于通过提高单核频率来提升性能变得越来越困难，处理器厂商开始增加处理器核数。在这种情况下，使用线程来做并发能有效提升CPU利用率，从而发挥多核处理器的能力。在Java中，线程池有着比较方便的实现类ThreadPoolExecutor，但是这个实现类并不是开箱即用的，需要一定的知识基础才能发挥出线程池的好处。Elasticsearch中就封装了一系列更实用的线程池实现，本篇文章就来探索一下ES源码大神们是如何实现ES中的线程池的。

### 二、线程池基础

首先先简单介绍一下线程池的任务调度机制，有以下几个重要参数：当前线程数current，核心线程数core，最大线程数max，存储等待任务的队列queue，任务调度可以用以下流程图表示：

可以参考一下Java线程池类ThreadPoolExecutor

```java
    /**
     * Creates a new {@code ThreadPoolExecutor} with the given initial
     * parameters.
     *
     * @param corePoolSize the number of threads to keep in the pool, even
     *        if they are idle, unless {@code allowCoreThreadTimeOut} is set
     * @param maximumPoolSize the maximum number of threads to allow in the
     *        pool
     * @param keepAliveTime when the number of threads is greater than
     *        the core, this is the maximum time that excess idle threads
     *        will wait for new tasks before terminating.
     * @param unit the time unit for the {@code keepAliveTime} argument
     * @param workQueue the queue to use for holding tasks before they are
     *        executed.  This queue will hold only the {@code Runnable}
     *        tasks submitted by the {@code execute} method.
     * @param threadFactory the factory to use when the executor
     *        creates a new thread
     * @param handler the handler to use when execution is blocked
     *        because the thread bounds and queue capacities are reached
     * @throws IllegalArgumentException if one of the following holds:<br>
     *         {@code corePoolSize < 0}<br>
     *         {@code keepAliveTime < 0}<br>
     *         {@code maximumPoolSize <= 0}<br>
     *         {@code maximumPoolSize < corePoolSize}
     * @throws NullPointerException if {@code workQueue}
     *         or {@code threadFactory} or {@code handler} is null
     */
    public ThreadPoolExecutor(int corePoolSize,
                              int maximumPoolSize,
                              long keepAliveTime,
                              TimeUnit unit,
                              BlockingQueue<Runnable> workQueue,
                              ThreadFactory threadFactory,
                              RejectedExecutionHandler handler) {
        if (corePoolSize < 0 ||
            maximumPoolSize <= 0 ||
            maximumPoolSize < corePoolSize ||
            keepAliveTime < 0)
            throw new IllegalArgumentException();
        if (workQueue == null || threadFactory == null || handler == null)
            throw new NullPointerException();
        this.corePoolSize = corePoolSize;
        this.maximumPoolSize = maximumPoolSize;
        this.workQueue = workQueue;
        this.keepAliveTime = unit.toNanos(keepAliveTime);
        this.threadFactory = threadFactory;
        this.handler = handler;
    }
```

其中的corePoolSize、maximumPoolSize和workQueue上面介绍过了。其余几个参数含义如下：
- keepAliveTime：当当前线程数大于核心线程数是，空闲线程等待新任务的时间，超过这个时间就会销毁该空闲线程
- unit：keepAliveTime的单位
- threadFactory：线程池创建线程的工厂类，可以自定义线程的名字
- handler：线程任务的拒绝handler，只需要重写RejectedExecutionHandler接口的rejectedExecution类就可以自定义线程被拒绝后的逻辑

### 三、ES线程池实现

ES的线程池实现类是ThreadPool，其中把不同的任务用不同的线程池分开。这样的好处一是隔离线程资源，避免当一种任务繁忙时影响到另一种任务的运行；二是可以为不同类型的任务分配不同类型的线程池，提高处理效率。

ES封装了一个SizeBlockingQueue类，有两个目的：

* 实现了一个有界的LinkedTransferQueue，主要是重写了offer方法：

```java
    @Override
    public boolean offer(E e) {
        while (true) {
            final int current = size.get();
            // 当前队列size大于队列的容量时，拒绝任务（此时已经到了最大线程数）
            if (current >= capacity()) {
                return false;
            }
            if (size.compareAndSet(current, 1 + current)) {
                break;
            }
        }
        boolean offered = queue.offer(e);
        if (!offered) {
            size.decrementAndGet();
        }
        return offered;
    }
```

* 为一些关键操作增加forcePut方法，实际上就是讲任务强行放入队列，避免关键的任务被拒绝后不会执行：

```java
    /**
     * Forces adding an element to the queue, without doing size checks.
     */
    public void forcePut(E e) throws InterruptedException {
        size.incrementAndGet();
        try {
            queue.put(e);
        } catch (InterruptedException ie) {
            size.decrementAndGet();
            throw ie;
        }
    }
```

拒绝的逻辑:

```java
    @Override
    public void rejectedExecution(Runnable r, ThreadPoolExecutor executor) {
        if (r instanceof AbstractRunnable) {
            if (((AbstractRunnable) r).isForceExecution()) {
                BlockingQueue<Runnable> queue = executor.getQueue();
                if (!(queue instanceof SizeBlockingQueue)) {
                    throw new IllegalStateException("forced execution, but expected a size queue");
                }
                try {
                    ((SizeBlockingQueue) queue).forcePut(r);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    throw new IllegalStateException("forced execution, but got interrupted", e);
                }
                return;
            }
        }
        rejected.inc();
        throw new EsRejectedExecutionException("rejected execution of " + r + " on " + executor, executor.isShutdown());
    }
```

参考链接：

1\.[Java线程池实现原理及其在美团业务中的实践](https://tech.meituan.com/2020/04/02/java-pooling-pratice-in-meituan.html)