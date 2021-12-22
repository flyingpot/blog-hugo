+++
categories = ["Elasticsearch源码解析"]
date = 2021-12-06T16:00:00Z
tags = ["Java", "Elasticsearch"]
title = "Elasticsearch源码解析——通信模块（三）"
url = "/post/elasticsearch-network3"
lastmod = 2021-12-22T21:38:00Z

+++
通过上一篇文章，节点间通讯的数据流动已经搞清楚了：

1. 所有节点在启动时都注册上了所有TransportAction对应的RequestHandler
2. 发送节点使用特定action向接收节点发送请求，发送前注册对应的ResponseHandler，通过requestId作为key存储在发送节点内存中。requestId通过网络发送给接收节点
3. 接收节点收到请求，通过action拿到对应的RequestHandler响应请求。requestId通过网络发送回发送节点
4. 发送节点收到请求，通过requestId拿到ResponseHandler处理response

那么，节点间的连接又是如何管理的呢？本文就通过源码梳理这一部分内容

## 一、ConnectionManager连接管理器

发送请求时不会重新建立连接，而是会从连接管理器中拿到一个连接来使用：

```Java
    /**
     * Returns either a real transport connection or a local node connection if we are using the local node optimization.
     * @throws NodeNotConnectedException if the given node is not connected
     */
    public Transport.Connection getConnection(DiscoveryNode node) {
        if (isLocalNode(node)) {
            return localNodeConnection;
        } else {
            return connectionManager.getConnection(node);
        }
    }
```

节点间通过openConnection和connectToNode来建立连接，区别是openConnection建立的连接不能通过ConnectionManager管理，需要发起连接的节点自己管理连接，而connectToNode方法建立的连接会通过ConectionManager管理。

建立连接会从两个类中发起（这里不考虑7版本前使用的Discovery模块类ZenDiscovery），一个是Coordinator：集群在选主过程中会建立连接，另一个是NodeConnectionsService：这个的类目的就是保持节点间的连接。

因此，节点间的连接可以认为是一直存在的，当需要Transport请求时，从ConnectionManager中拿到一个连接Connection使用就好。

## 二、Connection和NodeChannels

跟踪TransportService中的sendRequest代码，最终是通过远端节点对应的Connection实例来发送请求的：

```Java
connection.sendRequest(requestId, action, request, options);
```

Connection是一个接口，看下实现，发现可能是TcpTransport中的NodeChannels。跟一下代码发现确实是（代码比较深，这里文字描述下）：

1. 在ClusterConnectionManager的connectToNode方法中注册了一个listener回调
2. 根据ConnectionProfile的配置初始化所有channels，默认有13个连接，分别为以下几组
|  recovery   | bulk  | reg | state | ping |
|  ---------  | ----  | --- | ----- | ---- |
|     3       |   3   |  6  |    1  |   1  |
3. 确认所有连接之后，发送一个握手请求（ChannelConnectedListener）后完成连接初始化，调用listener.onResponse(nodeChannels)完成回调
4. connectToNode拿到channels将其注册到map中，方便连接重用

所以实际sendRequest调用的是NodeChannels的sendRequest方法，在序列化网络通信前，还判断了一下传入的options参数属于channel的哪一个类型，从连接池中选择对应类型的连接使用。

```Java
public TcpChannel channel(TransportRequestOptions.Type type) {
    ConnectionProfile.ConnectionTypeHandle connectionTypeHandle = typeMapping.get(type);
    if (connectionTypeHandle == null) {
        throw new IllegalArgumentException("no type channel for [" + type + "]");
    }
    return connectionTypeHandle.getChannel(channels);
}
```
