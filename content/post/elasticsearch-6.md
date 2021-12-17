+++
categories = ["Elasticsearch源码解析"]
date = 2021-11-29T16:00:00Z
tags = ["Elasticsearch", "Java"]
title = "Elasticsearch源码解析——Guice"
url = "/post/elasticsearch-node-start1"

+++
## 一、前言

最近萌生了考Elastic认证的想法，不过看了一下别人回忆总结的考题之后，发现Elastic认证考察点更倾向于Elasticsearch的使用，最新的考试也会考一些Elasticsearch 7.13的新特性，现阶段并不是很想了解这方面，就暂时搁置了。

本文会介绍一下ES中的Guice，结合一些典型的代码段，讲一下ES初始化时是如何进行实例的注入的。

## 二、Guice简介

Guice是一个Google出品的依赖注入框架，说起依赖注入，最容易想到的就是Spring框架。它的用处就是不需要考虑实例依赖的其他实例的初始化，使用一个容器来管理实例，通过简单的注解等方式将依赖的实例注入需要用到的实例。

Elasticsearch由于模块众多，并且模块间耦合也比较严重，不同模块可能会依赖很多相同的实例，因此引入一个依赖注入框架就能解决这个问题。Guice就这样被引入了ES的代码中，不过有意思的是，ES并不是用package的方式引入Guice的，而是fork了一个老版本的Guice代码，并放到了ES的源码中。这么做的目的不得而知，猜测可能是仅仅想用Guice的部分功能，源码引入的方式便于自己管理吧。

## 三、Guice相关代码

Guice本身的用法是比较多样的，最新的版本号已经到了5.0.1。但是ES中引入的Guice版本很老，大概是2.0。所以实际上，ES仅仅用了Guice很少的一部分特性。

ES对于Guice的使用主要是在各个Module中和Node类中。这里举ActionModule类作为说明：ActionModule类继承了AbstractModule抽象类并重写了configure方法，在这个方法中，主要就是完成实例到类的绑定

```Java
// 这里是将手动实例化的实例注册到对应的类上
bind(ActionFilters.class).toInstance(actionFilters);

// 这里是将循环将所有TransportAction相关实例注册起来，其中构造函数依赖的实例会自动注入
bind(action.getTransportAction()).asEagerSingleton();
```

然后在Node类中，client作为节点触发TransportAction的入口，会将所有TransportAction注入进来：
```Java
client.initialize(injector.getInstance(new Key<Map<ActionType, TransportAction>>() {}), () -> clusterService.localNode().getId(), transportService.getRemoteClusterService(), namedWriteableRegistry);
```

其中injector.getInstance可以根据Type来获取实例，其中injector是Node类中所有注入完成后得到的：

```Java
ModulesBuilder modules = new ModulesBuilder();
// 这里面把包括上面所说的ActionModule全部添加进来
modules.add(...);
injector = modules.createInjector();
```

这样完成后，通过调用injector.getInstance就可以根据类或者Type获取实例了，非常方便。

## 四、正在被抛弃的Guice

虽然上面说了很多Guice的优点，但是ES社区却一直打算把Guice从源码中去掉的，参考这个[issue](https://github.com/elastic/elasticsearch/issues/43881)https://github.com/elastic/elasticsearch/issues/43881)。原因其实也很明确：

> In addition to the overhead of keeping a forked copy, Guice blocks us from having a stable plugin api because plugin authors can get at any internal service from any plugin.

也就是说社区既不想维护一个fork过来的Guice版本，又因为Guice的引入，导致插件代码中可以随意调用内部的实例，这又导致了ES的插件接口无法稳定下来（因为去除Guice意味着需要增加一些无法用Guice获取的实例到接口中）。