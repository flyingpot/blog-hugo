+++
categories = []
date = 2021-07-12T16:00:00Z
draft = true
tags = ["Elasticsearch"]
title = "Elasticsearch分片副本那些事"
url = "/post/elasticsearch-shard-replica"

+++
#### 前言

从某种角度上说，ES是十分易用的，利用ES完成一些基本的写入和查询操作，只需要简单看下文档就能学会。但是ES又有很多配置可以自定义，当你有实际的业务需要时，如何能有效利用现有的资源达到比较好的时延和吞吐量确又非常困难。本文就聊一下分片（shard）和副本（replica），来看看究竟应该如何选择一个合适的分片和副本数。

#### 分片副本是什么

分片类似于数据库的分库分表，将一个索引里的数据分到不同的分片中。在写入过程中，通过相应的路由手段（默认规则是分片编号=hash(_id)%总分片数）写入相应的分片。在查询过程中，会分别查询所有分片并将结果汇总得到最终查询结果，这样就可以将非常大量的索引数据分散到不同的分片中，由于每个分片的查询都使用一个线程，这样可以有效地减小单次查询的时延。

副本其实很容易理解，用处就是保证当部分节点掉出集群时保证ES集群的可用性。副本数量越多，能容忍掉节点的数量就越多。另外，副本也是一种分片，也可以执行查询任务。

#### 分片副本数量应该怎么选

既然分片数量增加，单个线程可以更快地完成单shard的查询，那么是不是分片越多越好呢？其实并不是，分片数量过多会导致以下三个问题：
1. 多个shard并发查询会使用到更多的线程数，这样会增大CPU上下文切换次数，可能会增大时延
2. 一次查询会查询多个shard，并将结果合并，这会受木桶效应影响，一旦某一个或几个shard的查询时延增大，总的查询时延也会受到影响。（在这种情况下，网络波动是一个容易出现的影响因素）
3. ES使用主从机制，shard信息的元数据需要master节点管理。当shard数量增多时，master节点同步元数据的压力会增大，可能会影响集群的可用性。ES在7版本之后增加了一个参数cluster.max_shards_per_node限制单节点shard数量不超过1000





#### 参考链接
1. [如何估算吞吐量以及线程池大小](https://chanjarster.github.io/post/concurrent-programming/throughput-and-thread-pool-size/)
2. [并行、延迟与吞吐量](https://chanjarster.github.io/post/concurrent-programming/parallel-latency-throughput/)
3. [聊聊 Elasticsearch 的查询毛刺](https://www.easyice.cn/archives/361)
4. [How many shards should I have in my Elasticsearch cluster?](https://www.elastic.co/blog/how-many-shards-should-i-have-in-my-elasticsearch-cluster)