+++
categories = []
date = 2022-09-04T16:00:00Z
tags = ["Rust", "Go", "Tokio"]
title = "Tokio和Goroutine到底谁更快？"
url = "/post/tokio_goroutine_benchmark"

+++
最近看到reddit有这样一个对比[帖子](https://www.reddit.com/r/rust/comments/lg0a7b/benchmarking_tokio_tasks_and_goroutines/)，讲的是对比Go语言goroutine和Rust语言tokio runtime的性能。我最喜欢围观语言之间的性能之争了，就像器材党比较谁的器材更厉害一样。我内心的预期是这两种语言的并发性能应该是不相上下的，虽说Rust号称是跟C/C++性能差不多的系统级编程语言，并且没有GC损耗，但是Go语言的goroutine也是一大杀器，设计十分精妙，性能也很强。

### 对比场景和代码

这个帖子的楼主写了一些基准代码来对比goroutine和tokio的性能，场景为并发跑1000个任务：从/dev/urandom中读取10个字节，然后写入/dev/null中。代码可以参考这个[代码仓库](https://github.com/flyingpot/tokio-goroutine-perf)。楼主在主贴里面写了这三种基准代码：

1. 使用go关键字（对应goroutine.go）
2. 使用Rust标准库的thread::spawn创建线程（对应thread.rs）
3. 使用tokio库的async/await异步任务，其中读写文件也用了tokio的非阻塞方法，如tokio::fs（对应tokio_unblock.rs）

在我的Linux机器上跑这三个任务的结果分别为：

```
goroutine results:
1.31314911s total, 1.313149ms avg per iteration
std thread results:
14.420476843s total, 14.420476ms avg per iteration
tokio unblock results:
9.862689069s total, 9.862689ms avg per iteration

```

可以看到goroutine的性能真的很强，比下面两种快了好几倍。楼主的结果没有我测试的差别那么大，但排名是一样的。因此发帖问这是不是正常的Rust和Go的性能差别。因为按理说Tokio和Goroutine都使用了相似的协程策略，不应该有成倍的性能差距。

在继续分析之前，先简单讲讲Tokio和Goroutine的原理。

### Tokio和Goroutine的异步原理

如果你是个Java工程师，你应该会知道Netty编程有多复杂。定义pipeline，各种回调，代码量又多又难理解。可以说是很不符合人类的理解习惯。而Tokio是一个Rust的异步runtime，有了它就可以用实现底层异步，上层同步，从而用同步的方式写异步代码。这里举一个tokio官方的代码例子，这段代码实现了一个tcp server，会将客户端发来的数据原封不动的发回去：

```rust
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::TcpListener;

use std::error::Error;

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    let listener = TcpListener::bind("127.0.0.1:8081").await?;

    loop {
        let (mut socket, _) = listener.accept().await?;

        tokio::spawn(async move {
            let mut buf = vec![0; 1024];

            loop {
                let n = socket
                    .read(&mut buf)
                    .await
                    .expect("failed to read data from socket");

                if n == 0 {
                    return;
                }

                socket
                    .write_all(&buf[0..n])
                    .await
                    .expect("failed to write data to socket");
            }
        });
    }
}
```

可以看到绑定端口和实际的复制逻辑都是放在loop循环里的，但是却不会影响新连接和新数据的处理，看上去是同步语句，会阻塞代码运行，实际却是通过tokio的后台协程运行的，实现异步的效果。其中await就是一个异步关键字，当调用阻塞方法时只需要加上await就能将其变为异步运行，非常好用。

对于goroutine来说，异步代码实际上更为简单，甚至连await都不需要加：

```go
pacakge main

import (
	"fmt"
	"net"
	"bufio"
)

func handleConnection(c net.Conn) {
	for {
		netData, _ := bufio.NewReader(c).ReadString('\n')
		c.Write([]byte(string(netData)))
	}
	c.Close()
}

func main() {
	l, _ := net.Listen("tcp", "127.0.0.1:8080")

	for {
		c, _ := l.Accept()
		go handleConnection(c)
	}
}
```

只要将需要异步执行的方法前面加上go关键字，就把管理权交给goroutine，最终实现异步执行。

因此，使用goroutine或者tokio，人们就能忽略掉复杂的实现细节，从而更加专注地实现业务逻辑。

### 继续分析

回到帖子，下面有老哥提出优化建议是使用tokio的block_in_place方法。这个方法实际上是为了会阻塞的任务准备的，使用这个方法会告诉tokio的executor将其他任务调度到其他线程中去，避免因为阻塞导致的线程饥饿问题。

实现在tokio_block_in_place.rs中，结果为：

```
tokio block in place results:
3.654930239s total, 3.65493ms avg per iteration
```

原帖中的结果是与goroutine跑出来的基本相同了，我这里跑出来还是有2～3倍的差距。

下面还有老哥评论说使用tokio+同步的方式更快，因为/dev/urandom和/dev/null的读写根本不会阻塞。我一想确实，虽说调用了读和写，但是/dev/urandom和/dev/null可不同于一般的文件，属于特殊文件。man urandom查看了一下文档，发现果然有说明：

```
When  read,  the  /dev/urandom device returns random bytes using a pseudorandom number generator seeded from the entropy pool.  Reads from this device do not block (i.e., the CPU is not yielded), but can incur an appreciable delay when requesting large amounts of data.
```

试一下同步的方法，直接使用标准库的fs就好，代码见tokio_block.rs，结果如下：

```
tokio block results:
955.927534ms total, 955.927µs avg per iteration
```

可以看到比goroutine还要快一些。不过这个场景说实话没什么比较的意义，看看就好。

再回去分析下总体的结果：
1. goroutine：没啥好说的，既简单又快。
2. 标准库的thread：最慢是因为主要耗时都在线程的创建上了，因为thread会使用系统线程，创建起来耗时很长。
3. tokio+异步读写：使用tokio，比thread少了线程创建的开销，但是本来同步的操作使用异步接口导致多了很多不必要的上下文切换。
4. tokio+block_in_place：block_in_place调用是同步运行的，不过还是存在将其他任务切换到其他线程的开销。
5. tokio+同步：同步任务使用同步调用，搭配上tokio，达到了和goroutine类似的结果。

### 总结

这篇文章其实是标题党。性能比较是个复杂的事情，要考虑到很多问题，设立一个准确的场景再进行比较才有意义。就像这个帖子一样，楼主包括很多下面跟帖的人都没有意识到这个实验跟他们想象的场景根本就不一样，这种问题其实不容易发现。有时候你会发现性能差别很大，但是这种结果可能是受到了其他因素的影响，压根就跟测试对象没有关系。所以设计出合理的benchmark是很难的。

从这个实验也能看出来Go和Rust的不同之处，Go语言就像是更新更强的Java，很简单性能又好。不需要学非常多的知识就能写出性能不错的代码。Rust就不一样，它是类似于C++的系统语言，比较复杂，用法非常多，可自定义的地方也很多，要写出高性能的代码可能需要下更多功夫。
