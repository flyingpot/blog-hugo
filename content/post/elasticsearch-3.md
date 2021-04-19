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

ES的拒绝逻辑只需要重写RejectedExecutionHandler接口的rejectedExecution类就可以自定义

ES封装了一个SizeBlockingQueue类，有两个目的：
- 实现了一个有界的LinkedTransferQueue，主要是重写了offer方法：
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
- 为一些关键操作增加forcePut方法，实际上就是讲任务强行放入队列，避免关键的任务被拒绝后不会执行：
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

1.[Java线程池实现原理及其在美团业务中的实践](https://tech.meituan.com/2020/04/02/java-pooling-pratice-in-meituan.html)