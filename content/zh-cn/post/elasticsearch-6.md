+++
categories = []
date = 2021-11-29T16:00:00Z
draft = true
tags = ["Elasticsearch", "Java"]
title = "Elasticsearch源码解析——节点初始化（一）"
url = "/post/elasticsearch-node-start1"

+++
## 一、前言

最近萌生了考Elastic认证的想法，不过看了一下别人回忆总结的考题之后，发现Elastic认证考察点更倾向于Elasticsearch的使用，最新的考试也会考一些Elasticsearch 7.13的新特性，现阶段并不是很想了解这方面，就暂时搁置了。

本文会从Guice讲起，结合一些典型的代码段，讲一下ES初始化时是如何进行实例的注入的。

## 二、Guice简介

Guice是一个Google出品的依赖注入框架，说起依赖注入，最容易想到的就是Spring框架。它的用处就是不需要考虑实例依赖的其他实例的初始化，使用一个容器来管理实例，通过简单的注解等方式将依赖的实例注入需要用到的实例。

Elasticsearch由于模块众多，并且模块间耦合也比较严重，不同模块可能会依赖很多相同的实例，因此引入一个依赖注入框架就能解决这个问题。Guice就这样被引入了ES的代码中，不过有意思的是，ES并不是用package的方式引入Guice的，而是fork了一个老版本的Guice代码，并放到了ES的源码中。这么做的目的不得而知，猜测可能是仅仅想用Guice的部分功能，源码引入的方式便于自己管理吧。