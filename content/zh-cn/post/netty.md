+++
categories = []
date = 2021-08-02T16:00:00Z
draft = true
tags = ["Netty", "Java"]
title = "Netty的主从多线程，你真的理解了吗？"
url = "/post/netty-reactor"

+++
### 一、前言

Netty是一个非常成熟的Java NIO库，被用在了许多大型项目中，比如Elasticsearch、Vert.x等。之前没有仔细阅读过Netty源码，但是通过网络上的文章对Netty的基本原理了解了一些。比如说，Netty使用的是主从多线程模型，其中，boss线程池负责接收请求，worker线程池负责处理请求。

但是，前一段时间，我在定位一个由于JNI（Java Native Interface)导致的ES网络线程死锁问题时，发现虽然Netty的线程池大部分都死锁了，但是仍然有一个线程是完全空闲的。而我通过阅读ES源码发现，Netty的boss线程和worker线程是一样的，根据我之前的理解，不应该有一个线程出现完全空闲的情况。这让我十分诧异，按照我的理解，出现这种情况的唯一一种解释就是：处理accept只占用了一个boss线程，由于没有新连接，所以那个线程始终时空闲的。

由此，我开始阅读起了Netty源码，发现这个问题，真的不是有些文章里面说的那样。

### 二、