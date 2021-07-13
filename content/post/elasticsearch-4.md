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

#### 分片和副本是什么

分片类似于数据库的分库分表，将一个索引里的数据分到不同的分片中。在写入过程中，通过相应的路由手段（默认规则是分片编号=hash(_id)%总分片数）写入相应的分片。在查询过程中，会分别查询所有分片并将结果汇总得到最终查询结果。

副本



#### 参考链接
1. [如何估算吞吐量以及线程池大小](https://chanjarster.github.io/post/concurrent-programming/throughput-and-thread-pool-size/)
2. [并行、延迟与吞吐量](https://chanjarster.github.io/post/concurrent-programming/parallel-latency-throughput/)
3. [聊聊 Elasticsearch 的查询毛刺](https://www.easyice.cn/archives/361)
4. [How many shards should I have in my Elasticsearch cluster?](https://www.elastic.co/blog/how-many-shards-should-i-have-in-my-elasticsearch-cluster)