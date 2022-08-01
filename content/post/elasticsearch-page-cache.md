+++
categories = []
date = 2022-07-31T16:00:00Z
tags = ["Elasticsearch", "Lucene", "Page Cache", "Java"]
title = "深入理解Elasticsearch中的缓存——Page Cache"
url = "/post/elasticsearch-cache-page-cache"

+++
ES有一篇[官方博客](https://www.elastic.co/cn/blog/elasticsearch-caching-deep-dive-boosting-query-speed-one-cache-at-a-time)，这篇博客深入探讨了ES的几种缓存机制，但是基本都是概念性的介绍。有时在ES的实际使用中，仍然搞不清楚缓存的原理。本文就基于ES的缓存机制，深入到源码中探究其底层原理。

## 页缓存 Page Cache

页缓存是Linux操作系统提供的磁盘在内存中的缓存。当使用系统调用read时，内核会先检查要读取的内容是否在页缓存中存在，存在则直接返回，不存在才会触发中断来读磁盘。这些都比较清晰，没什么好分析的。不过Elasticsearch使用了mmap和read两种方式来读取不同的索引文件，这个值得分析一下（关于mmap和read的区别，可以参考我之前翻译的[文章](https://fanjingbo.com/post/linux-io/)）。

> 如果你查看生产环境集群的操作系统内存占用，会发现可用内存极少，页缓存都被占满了。这个就是页缓存的作用，尽可能的加载索引文件，来加速查询。这也是ES比较吃内存大小的原因。

### Lucene的逻辑

我们先来看Lucene，Lucene的读取过程使用Directory.openInput来打开文件流。Directory有多种实现，其中mmap在Lucene中对应的是MmapDirectory，read在Lucene中对应的是NIOFSDirectory。

其实Lucene在大多数情况下都使用的是mmap读取索引文件的。代码如下：

```Java
public static FSDirectory open(Path path, LockFactory lockFactory) throws IOException {  
  if (Constants.JRE_IS_64BIT && MMapDirectory.UNMAP_SUPPORTED) {  
    return new MMapDirectory(path, lockFactory);  
  } else {  
    return new NIOFSDirectory(path, lockFactory);  
  }  
}
```

其中JRE_IS_64BIT代表JVM是否为64位，UNMAP_SUPPORTED代表是否能加载Unsafe类的invokeCleaner方法（当关闭mmap文件流时调用这个方法清除mmap对应的直接内存，来实现unmap的效果）。正常情况下这两个值都会是true，因此可以认为Lucene默认使用mmap读取索引文件。

### Elasticsearch的逻辑

再来看下ES的逻辑，ES默认使用了一个HybridDirectory的实现类，这个类使用了代理模式，被代理的就是MmapDirectory，父类是NIOFSDirectory。当以下方法返回true时使用mmap，返回false时使用read：

```Java
boolean useDelegate(String name) {  
    String extension = FileSwitchDirectory.getExtension(name);  
    switch(extension) {  
        // Norms, doc values and term dictionaries are typically performance-sensitive and hot in the page  
        // cache, so we use mmap, which provides better performance.  
        case "nvd":  
        case "dvd":  
        case "tim":  
        // We want to open the terms index and KD-tree index off-heap to save memory, but this only performs  
        // well if using mmap.  
        case "tip":  
        // dim files only apply up to lucene 8.x indices. It can be removed once we are in lucene 10  
        case "dim":  
        case "kdd":  
        case "kdi":  
        // Compound files are tricky because they store all the information for the segment. Benchmarks  
        // suggested that not mapping them hurts performance.  
        case "cfs":  
        // MMapDirectory has special logic to read long[] arrays in little-endian order that helps speed  
        // up the decoding of postings. The same logic applies to positions (.pos) of offsets (.pay) but we  
        // are not mmaping them as queries that leverage positions are more costly and the decoding of postings  
        // tends to be less a bottleneck.  
        case "doc":  
            return true;  
        // Other files are either less performance-sensitive (e.g. stored field index, norms metadata)  
        // or are large and have a random access pattern and mmap leads to page cache trashing  
        // (e.g. stored fields and term vectors).  
        default:  
            return false;  
    }  
}
```

可以看到上面定义文件后缀都使用mmap，其他情况下使用read。

关于mmap和read的性能比较，这个stackoverflow[高赞回答](https://stackoverflow.com/questions/45972/mmap-vs-reading-blocks)讲的很清晰。mmap与read相比的优势在于：少了一次内存从内核空间到用户空间的拷贝，对于需要常驻内存的文件和随机读取场景更适用；而反过来read的优势在于，调用开销少，不需要构建内存映射的页表等操作（包括unmap），对于少量顺序读取或者读取完就丢弃的场景更适用。

实际上ES的使用逻辑是符合这个结论的，对于nvd、dvd、tim等索引文件，由于查询频率很高，因此使用mmap常驻内存，对于fdx、fdm、nvm等索引元数据文件，读完需要的内容就可以丢弃，则应该使用read来读，另外一种上面没有提到的场景是fdt文件，由于存放原始数据，磁盘占用较大，全部使用mmap加载到内存中会导致页缓存抖动，真正需要常驻内存的索引文件会被换出页缓存，会导致性能劣化，因此也需要使用read。

### 写入场景

上面提到的都是读取场景，MmapDirectory代码的第一段注释是这么写的：

 ```
 File-based Directory implementation that uses mmap for reading, and FSDirectory.FSIndexOutput for writing.
```

FSIndexOutput实际上就会使用write而不是mmap来进行写入操作。我之前一直很好奇为什么写入不使用mmap。其实答案很明显，在实际写入之前，是没办法知道写入文件大小的，没有大小，就不能使用mmap + msync的方式进行写入（实际需要先ftruncate来修改出一个指定大小的文件用来mmap，这些操作很麻烦），而write调用则不受这个限制，并且ES的写入都是顺序写，使用write也是非常适合的。

## 总结

以上是关于页缓存的ES原理分析，下一篇会讨论ES查询相关的cache。