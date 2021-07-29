+++
categories = []
date = 2021-07-28T16:00:00Z
draft = true
tags = ["Elasticsearch", "Java"]
title = "Elasticsearch源码解析——线程池（二）"
url = "/post/elasticsearch-threadpool2"

+++
### 一、前言

上一篇文章讲了一下ES源码中线程池实现和具体的应用，本文会介绍一下ES中封装的线程上下文实现ThreadContext

### 二、ThreadLocal是什么

JDK自带一个线程上下文ThreadLocal的实现，有了ThreadLocal，用户可以定义出来仅在同一个线程共享的参数。在一些场景（比如Web服务）中，同一个请求是由同一个线程处理的，可以在这个请求里面通过ThreadLocal共享参数，不需要把参数在方法之间互相传递，非常方便。比如SpringMVC中的RequestContextHolder。

但是，ThreadLocal也有一些问题，比如我需要在当前线程中新起一个线程做异步操作，那么使用ThreadLocal无法把当前线程保存的参数共享给异步线程。阿里的[transmittable-thread-local](https://github.com/alibaba/transmittable-thread-local)就是解决这个问题的


```Java
TransmittableThreadLocal<String> context = new TransmittableThreadLocal<>();

// =====================================================

// 在父线程中设置
context.set("value-set-in-parent");

Runnable task = new RunnableTask();
// 额外的处理，生成修饰了的对象ttlRunnable
Runnable ttlRunnable = TtlRunnable.get(task);
executorService.submit(ttlRunnable);

// =====================================================

// Task中可以读取，值是"value-set-in-parent"
String value = context.get();
```
