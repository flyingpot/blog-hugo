+++
date = "2019-03-11T16:00:00+00:00"
title = "CTF探秘（一）—— collision (pwnable.kr)"
url = "/post/ctf1"

+++

# 一、前言


最近突然对CTF产生了兴趣，感觉能从中学到很多东西。所以我打算写一系列文章记录在刷题过程中学到的知识。

# 二、题目及分析


今天做的题目是pwnable.kr里面的第二题——collision（第一题比较简单，就直接跳过了）。先是用ssh连到一个提供的主机上，发现目录下有三个文件。
![](/images/ls-l.png)
col.c的代码如下：

```c
#include <stdio.h>
#include <string.h>
unsigned long hashcode = 0x21DD09EC;
unsigned long check_password(const char* p){
        int* ip = (int*)p;
        int i;
        int res=0;
        for(i=0; i<5; i++){
                res += ip[i];
        }
        return res;
}

int main(int argc, char* argv[]){
        if(argc<2){
                printf("usage : %s [passcode]\n", argv[0]);
                return 0;
        }
        if(strlen(argv[1]) != 20){
                printf("passcode length should be 20 bytes\n");
                return 0;
        }

        if(hashcode == check_password( argv[1] )){
                system("/bin/cat flag");
                return 0;
        }
        else
                printf("wrong passcode.\n");
        return 0;
}
```

细节先不看，我们可以看到最后是调用cat命令读取flag文件。我们的当前用户如下图所示：
![](/images/id.png)

# 三、文件系统权限

回忆一下文件系统权限：第一位是文件类型，一般常见的就两种，’代表普通文件，d代表目录。其实还有很多别的类型，通过以下命令可以看到：

```bash
info ls "What information is listed"
```

后面一共九位，可以被分为三组，代表文件拥有者权限，群组权限和其他用户权限。每一组按顺序分别代表读(Read)，写(Write)和执行(Execute)。对于读和写比较简单，r或w代表可读或可写，-代表不可读(写)。执行位除了x(可执行)和-(不可执行)外，还有其他可能，常见的就是s。s代表x被激活，另外只可能出现在前两组里面，分别被称为setuid和setgid。当可执行文件被设置setuid或setgid时，可执行文件拥有的权限是可执行文件的文件拥有者或群组权限，而不是当前的用户或者群组所拥有的权限。

说起来挺绕口，但其实很好理解，拿这道题举例子来串联上面的所有知识：当前用户属于col群组，而col可执行文件的群组权限是x，也属于col群组，所以当前用户可以执行col文件，而又因为col的setuid被激活，执行col文件相当于col_pwn这个用户执行col文件，而flag文件又是属于col_pwn用户的，所以运行col文件可以读取flag文件的内容。

# 四、字节序

接下来看看题目要我们做什么，我们只需要让check_password(argv[1](#))等于hashcode即可。

#### 参考链接

1. [ File Permissions and Attributes ](https://wiki.archlinux.org/index.php/File_permissions_and_attributes)
2. [Setuid](https://en.wikipedia.org/wiki/Setuid)