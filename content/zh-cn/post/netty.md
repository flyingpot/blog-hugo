+++
categories = []
date = 2021-08-02T16:00:00Z
tags = ["Netty", "Java"]
title = "Netty的主从多线程，你真的理解了吗？"
url = "/post/netty-reactor"

+++
### 一、前言

Netty是一个非常成熟的Java NIO库，被用在了许多大型项目中，比如Elasticsearch、Vert.x等。之前没有仔细阅读过Netty源码，但是通过网络上的文章对Netty的基本原理了解了一些。比如说，Netty使用的是主从多线程模型，其中，boss线程池负责接收请求，worker线程池负责处理请求。

但是，前一段时间，我在定位一个由于JNI（Java Native Interface)导致的ES网络线程死锁问题时，发现虽然Netty的线程池大部分都死锁了，但是仍然有一个线程是完全空闲的。而我通过阅读ES源码发现，Netty的boss线程和worker线程使用了同一个线程池，按理说不应该有一个线程出现完全空闲的情况。这让我十分诧异，在我的理解中，出现这种情况的唯一一种解释就是：处理accept只占用了一个boss线程，由于没有新连接，所以那个线程始终时空闲的。我简单Google了一下，发现好像的确是[这样](https://github.com/netty/netty/issues/8925)的。

由此，我开始阅读起了Netty源码，毕竟纸上得来终觉浅嘛。最后我发现这个问题，真的不是有些文章里面说的那样。本篇文章会从网络I/O的类型出发，一直讲到Netty的设计哲学，最终从代码角度解决Netty的主从多线程到底是什么的问题。

### 二、网络I/O的几种类型

先梳理一下老生常谈的几种网络I/O类型，根据《UNIX网络编程》书中的定义，分为以下四种：阻塞I/O、非阻塞I/O、I/O多路复用和异步I/O（其实还有一种信号驱动I/O，由于不常用，所以这里略过不讨论）。

这里举一个例子来对照这几种I/O方法。有一位客人（用户进程）来到大排档吃夜宵（读取网络I/O），大排档有很多档口，有小烧烤，有臭豆腐，有烤冷面（不同的连接）。这个客人胃口很大，他都想吃。但是每个摊位人都很多。这个时候，客人的点菜就可以类比为应用从网络I/O中读取数据的过程，小烧烤等摊位老板制作美食的过程可以类比为内核做的I/O操作。下面就看看这四种方式都是什么样的：

- 阻塞I/O：最简单的I/O方式，客人走到摊位前排队，一直等到摊主做完后交给客人，然后客人去下一个摊位，以此类推。

- 非阻塞I/O：客人嗓门儿比较大，他每隔一段时间通过喊的方式尝试跟各个摊主点餐，每隔一会问一下轮到自己了没有，等到轮到自己之后去各个摊位等老板制作完成。

- I/O多路复用：客人懒得自己管，于是雇了一个小弟（select、poll、epoll）帮助自己点餐，等到小弟告诉自己排到了之后，客人自己去各个摊位等老板制作完成。

- 异步I/O：客人雇了一个高级小弟，不但帮助自己点餐，等排到了之后还帮自己等老板做好，最后直接给客人送过来。

可以看出来，以上四种I/O方式，从上到下用户进程被占用的越来越少，从阻塞I/O的线程完全被占用，到异步I/O的只需要发一个请求，完全不占用线程。实际上Netty用的就是I/O多路复用的方式。

### 三、Netty的基本原理

Netty用到了反应器设计模式（Reactor Design Pattern)，这里直接摘抄一下[Wiki](https://en.wikipedia.org/wiki/Reactor_pattern)对于反应器模式的说明：

> The reactor design pattern is an **event handling** pattern for handling service requests delivered **concurrently** to a service handler by one or more inputs. The service handler then demultiplexes the incoming requests and dispatches them **synchronously** to the associated request handlers.

这段话信息量很大，注意几个关键词：

- 事件驱动：这里的事件就是select、epoll通知出现网络I/O的事件

- 并发：可以处理并发请求（这种并发不是一个I/O一个线程，而是一个线程处理多个Channel的请求）

- 同步：当新的I/O进来之后，被分配到每个线程的handler上的读取、解码等操作都是同步的

这个反应器的定义很好地说明了Netty的几大特点。

接下来开始进入正题，什么是主从多线程？为什么要用主从多线程？

实际上上面这些知识融会贯通之后，Netty服务端的模型其实就很顺理成章了：

- 需要多线程处理高并发

- 使用select等达到非阻塞的目的（实际出现新I/O时再读取）

- 使用**一个**线程处理OP_ACCEPT请求（因为只有一个服务端Channel通过一个端口提供服务，只能用上一个线程），在Channel建立连接之后分发给其他线程

所谓的主从多线程，主指的就是Acceptor线程（Netty中的boss线程），从指的是实际处理I/O的请求的线程（Netty中的worker线程）。很多中文博客里面写的boss线程和worker线程都是线程池的情况才叫主从多线程，实际上是完全不对的。这些文章的作者可能是看到了Netty初始化的时候可以指定两个线程池从而脑补出来的：

```Java
    /**
     * Specify the {@link EventLoopGroup} which is used for the parent (acceptor) and the child (client).
     */
    @Override
    public ServerBootstrap group(EventLoopGroup group) {
        return group(group, group);
    }

    /**
     * Set the {@link EventLoopGroup} for the parent (acceptor) and the child (client). These
     * {@link EventLoopGroup}'s are used to handle all the events and IO for {@link ServerChannel} and
     * {@link Channel}'s.
     */
    public ServerBootstrap group(EventLoopGroup parentGroup, EventLoopGroup childGroup) {
        super.group(parentGroup);
        ObjectUtil.checkNotNull(childGroup, "childGroup");
        if (this.childGroup != null) {
            throw new IllegalStateException("childGroup set already");
        }
        this.childGroup = childGroup;
        return this;
    }
```

然而实际上boss线程池中只有一个线程被当成Acceptor来用，这也是为什么Elasticsearch源码直接调用的是上面那个方法，让boss和worker共享一个线程池。

### 四、总结

到此为止，我在前言中提到的困惑已经得到了解答。一点困惑很容易产生，但是我却花了很多时间解决这份困惑并写出这篇文章。并且，对于互联网上的信息，很多时候还是要抱着批判的眼光去看待，不能随意相信。（其实本文也有很多内容经不起推敲，以后有机会还会再写一写Netty的）