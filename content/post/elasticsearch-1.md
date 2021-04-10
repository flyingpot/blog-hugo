+++
date = 2021-04-09T16:00:00Z
draft = true
title = "Elasticsearch源码解析——通信模块（一）"
url = "/post/elasticsearch-network1"

+++
### 一、前言

从本文开始，我打算开一个新坑，分模块来讲一讲ES的源码。本系列的目的主要是方便我自己对于ES源码的理解进行梳理和总结。当然，如果有人能读到我的解析并能从中获益就更好了。本系列文章会基于ES在github上的最新开源代码，版本是7.12.0。

### 二、Elasticsearch的模块化

在开源项目索引网站openhub上可以查到，目前ES的源码行数有200w行。在Java代码世界里也算是一个庞然大物级别的项目（Spring框架总代码量138w行）。ES用200w行代码构建了一个带分布式的全文搜索引擎，具有很好的定制化能力，性能良好，并且开箱即用。

Elasticsearch的模块化做的很不错，不同功能用不同的service或者module实现。基于完善的模块化，Elasticsearch也从源码中放开了对于模块的自定义，支持通过插件包的形式对于各种模块进行定制化。并且可定制的功能非常丰富，从底层的search engine到上层的配置，不需要改动ES的代码就能增加很多功能。Amazon开源的Open Distro项目就包括很多定制化插件，而ES官方的商业X-Pack版本也是由一系列的插件包组成的。

本文就从ES的通信模块NetworkModule开始，来详细讲解下ES源码是如何实现通信功能的。

### 三、网络模块初始化

ES的网络请求分为两类：一个是客户端连接集群节点用的Rest请求，走HTTP协议，另一个是集群节点之间的Transport请求，走TCP协议。接下来看代码，首先看ES通信模块类NetworkModule的构造函数：
```java

        /**
         * Creates a network module that custom networking classes can be plugged into.
         * @param settings The settings for the node
         */
        public NetworkModule(Settings settings, List<NetworkPlugin> plugins, ThreadPool threadPool,
                             BigArrays bigArrays,
                             PageCacheRecycler pageCacheRecycler,
                             CircuitBreakerService circuitBreakerService,
                             NamedWriteableRegistry namedWriteableRegistry,
                             NamedXContentRegistry xContentRegistry,
                             NetworkService networkService, HttpServerTransport.Dispatcher dispatcher,
                             ClusterSettings clusterSettings) {
            this.settings = settings;
            for (NetworkPlugin plugin : plugins) {
                Map<String, Supplier<HttpServerTransport>> httpTransportFactory = plugin.getHttpTransports(settings, threadPool, bigArrays,
                    pageCacheRecycler, circuitBreakerService, xContentRegistry, networkService, dispatcher, clusterSettings);
                for (Map.Entry<String, Supplier<HttpServerTransport>> entry : httpTransportFactory.entrySet()) {
                    // Rest请求handler注册
                    registerHttpTransport(entry.getKey(), entry.getValue());
                }
                Map<String, Supplier<Transport>> transportFactory = plugin.getTransports(settings, threadPool, pageCacheRecycler,
                    circuitBreakerService, namedWriteableRegistry, networkService);
                for (Map.Entry<String, Supplier<Transport>> entry : transportFactory.entrySet()) {
                    // Transport请求handler注册
                    registerTransport(entry.getKey(), entry.getValue());
                }
                List<TransportInterceptor> transportInterceptors = plugin.getTransportInterceptors(namedWriteableRegistry,
                    threadPool.getThreadContext());
                for (TransportInterceptor interceptor : transportInterceptors) {
                    registerTransportInterceptor(interceptor);
                }
            }
        }
```
   
其中遍历了实现NetworkPlugin的插件，并分别注册了Rest和Transport的handler。在ES代码中，以Plugin结尾的都是插件要实现的一些重要接口，需要实现哪种功能就去实现接口中定义的对应方法就好。其中NetworkPlugin中就定义了以下两个重要方法：
```java
    /**
     * Returns a map of {@link Transport} suppliers.
     * See {@link org.elasticsearch.common.network.NetworkModule#TRANSPORT_TYPE_KEY} to configure a specific implementation.
     */
    default Map<String, Supplier<Transport>> getTransports(Settings settings, ThreadPool threadPool, PageCacheRecycler pageCacheRecycler,
                                                           CircuitBreakerService circuitBreakerService,
                                                           NamedWriteableRegistry namedWriteableRegistry, NetworkService networkService) {
        return Collections.emptyMap();
    }

    /**
     * Returns a map of {@link HttpServerTransport} suppliers.
     * See {@link org.elasticsearch.common.network.NetworkModule#HTTP_TYPE_SETTING} to configure a specific implementation.
     */
    default Map<String, Supplier<HttpServerTransport>> getHttpTransports(Settings settings, ThreadPool threadPool, BigArrays bigArrays,
                                                                         PageCacheRecycler pageCacheRecycler,
                                                                         CircuitBreakerService circuitBreakerService,
                                                                         NamedXContentRegistry xContentRegistry,
                                                                         NetworkService networkService,
                                                                         HttpServerTransport.Dispatcher dispatcher,
                                                                         ClusterSettings clusterSettings) {
        return Collections.emptyMap();
    }          
```

分别负责
          实际上默认的实现在modules文件夹下的transport-netty4插件里面。为了实现可插拔ES做了很巧妙的设计，以Rest请求的handler为例，在实际要初始化handler时会读取http.type这个配置，如果没有设置，就会取http.type.default这个配置，而这个配置，就已经写死在了transport-netty4插件里面。所以，默认情况下，ES就会使用transport-netty4里面的网络模块。而如果你想定制自己的网络模块，只需要写一个类似transport-netty4的插件，然后指定http.type这个配置就好。
    
```java
       public Supplier<HttpServerTransport> getHttpServerTransportSupplier() {
        final String name;
        if (HTTP_TYPE_SETTING.exists(settings)) {
            name = HTTP_TYPE_SETTING.get(settings);
        } else {
            name = HTTP_DEFAULT_TYPE_SETTING.get(settings);
        }
        final Supplier<HttpServerTransport> factory = transportHttpFactories.get(name);
        if (factory == null) {
            throw new IllegalStateException("Unsupported http.type [" + name + "]");
        }
        return factory;
    }       
```