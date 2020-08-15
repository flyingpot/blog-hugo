+++
date = 2020-08-15T16:00:00Z
draft = true
title = "CTF从零单排（二）—— bof (pwnable.kr)"
url = "ctf2"

+++
# CTF从零单排（一）—— bof (pwnable.kr)

# 一、题目分析

查看题目给出的信息，一个C代码文件和一个可执行文件，C代码文件如下：

\`\`\`c

    #include <stdio.h>
    #include <string.h>
    #include <stdlib.h>
    void func(int key){
    	char overflowme[32];
    	printf("overflow me : ");
    	gets(overflowme);	// smash me!
    	if(key == 0xcafebabe){
    		system("/bin/sh");
    	}
    	else{
    		printf("Nah..\n");
    	}
    }
    int main(int argc, char* argv[]){
    	func(0xdeadbeef);
    	return 0;
    }

\`\`\`

可以看出这道题考的是栈溢出，从标准输入读取的数据覆盖掉func传入的参数值即可提权。关键问题就是如何构造这个数据。

## 二、题解

使用gdb对可执行文件bof进行分析