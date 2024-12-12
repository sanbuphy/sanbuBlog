---
title: "防止stack overflow——内存地址杀毒 2022-07-30"
---

提问：

- 我们有什么检测手段（编译器或者操作系统自带检测）能防止stack overflow？或者说防止出栈超界

- 程序中的内存地址规定好r但不给w能防止栈溢出覆盖吗？或者出栈超界

- 内核也是程序，如果发生了溢出会直接panic，是不是崩溃本身就作为了一种保护机制？

答：（详细参考蒋炎岩的这一课：[并发 Bug 和应对](http://jyywiki.cn/OS/2022/slides/8.slides#/5/5)）

1、请看如下解释

2、值得做实验尝试，因为理论上我们是能够访修改内存地址权限的（这里有个小知识，为什么栈的内存地址不仅可读可写还可【执行】呢？因为这代表着CPU能读取译码并执行）

3、是的，详见panic()

## Buffer Overrun 检查

Canary (金丝雀) 对一氧化碳非常敏感
用生命预警矿井下的瓦斯泄露 (since 1911)

计算机系统中的 canary
“牺牲” 一些内存单元，来预警 memory error 的发生
(程序运行时没有动物受到实质的伤害)

比如把一些内存块“涂色”，如果发现它的“颜色被覆盖了”则说明有些保护的区域被访问了，这是错误的。（或者像PA那样的越界报错

## 没用过 lint/sanitizers？

具体请点击：[并发 Bug 和应对](http://jyywiki.cn/OS/2022/slides/8.slides#/5/5)

AddressSanitizer (asan); (paper): 非法内存访问
Buffer (heap/stack/global) overflow, use-after-free, use-after-return, double-free, ...
Demo: uaf.c; kasan  
ThreadSanitizer (tsan): 数据竞争
Demo: fish.c, sum.c, peterson-barrier.c; ktsan  
MemorySanitizer (msan): 未初始化的读取  
UBSanitizer (ubsan): undefined behavior
Misaligned pointer, signed integer overflow, ...
Kernel 会带着 -fwrapv 编译  
