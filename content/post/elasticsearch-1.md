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

Elasticsearch的模块化做的很不错，不同功能用不同的service或者module实现。基于完善的模块化，Elasticsearch从源码中放开了对于模块的自定义能力，支持通过插件包的方式对于各模块进行定制化。可以定制的功能非常丰富，从底层的search engine到上层的配置，不需要改动ES的代码就能增加自定义功能。比如说，Amazon开源的Open Distro项目就包括很多定制化插件，而ES官方的商业X-Pack版本也是由一系列的插件包组成的。

本文就从ES的通信模块开始，来详细讲解下ES源码是如何实现通信功能的。

### 三、网络模块初始化

ES的网络请求分为两类：一个是客户端连接集群节点用的Rest请求，走HTTP协议，另一个是集群节点之间的Transport请求，走TCP协议。接下来看代码，直接从ES通信模块类NetworkModule看起：

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

其中遍历了实现NetworkPlugin的插件，并分别注册了Rest和Transport的handler，实际使用时，取出来具体的handler来初始化。在ES代码中，以Plugin结尾的都是插件要实现的一些重要接口，需要实现哪种功能就去实现接口中定义的对应方法就好。其中NetworkPlugin中就定义了以下两个重要方法：

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

分别对应了Rest和Transport的handler实现。

在节点初始化时，会通过下面这个方法获取Rest接口的handler（Transport接口同理），依次读取http.type和http.default.type这两个配置。而ES默认的网络实现是通过transport-netty4插件实现的，在这个插件中，会设置http.default.type配置。当用户没有自制自己的网络模块时，就会使用默认的netty实现。如果用户需要自定义时，只需要在插件中设置自己的网络模块名字，然后修改ES的http.type配置就好。

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

### 四、Rest请求处理流程

接下来一步一步分析ES时如何处理Rest请求的，