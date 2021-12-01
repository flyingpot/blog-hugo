+++
categories = []
date = 2021-11-29T16:00:00Z
draft = true
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

ES对于Guice的使用主要是在各个Module中和Node类中。这里举一个ActionModule类作为说明：ActionModule类继承了AbstractModule抽象类并重写了configure方法，在这个方法中，主要就是完成实例到类的绑定

```Java

```