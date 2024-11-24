---
title: 计算机上的时间 从CPU L1 L2再到网络连接的延时比较 2023-02-25
---


以下转自：[https://stackoverflow.com/questions/4087280/approximate-cost-to-access-various-caches-and-main-memory](https://stackoverflow.com/questions/4087280/approximate-cost-to-access-various-caches-and-main-memory)

```bash
           0.5 ns - CPU L1 dCACHE reference
           1   ns - speed-of-light (a photon) travel a 1 ft (30.5cm) distance
           5   ns - CPU L1 iCACHE Branch mispredict
           7   ns - CPU L2  CACHE reference
          71   ns - CPU cross-QPI/NUMA best  case on XEON E5-46*
         100   ns - MUTEX lock/unlock
         100   ns - own DDR MEMORY reference
         135   ns - CPU cross-QPI/NUMA best  case on XEON E7-*
         202   ns - CPU cross-QPI/NUMA worst case on XEON E7-*
         325   ns - CPU cross-QPI/NUMA worst case on XEON E5-46*
      10,000   ns - Compress 1K bytes with Zippy PROCESS
      20,000   ns - Send 2K bytes over 1 Gbps NETWORK
     250,000   ns - Read 1 MB sequentially from MEMORY
     500,000   ns - Round trip within a same DataCenter
  10,000,000   ns - DISK seek
  10,000,000   ns - Read 1 MB sequentially from NETWORK
  30,000,000   ns - Read 1 MB sequentially from DISK
 150,000,000   ns - Send a NETWORK packet CA -> Netherlands
|   |   |   |
|   |   | ns|
|   | us|
| ms|
```

```bash
2020: Still some improvements, prediction for 2025
-------------------------------------------------------------------------
             0.1 ns - NOP
             0.3 ns - XOR, ADD, SUB
             0.5 ns - CPU L1 dCACHE reference           (1st introduced in late 80-ies )
             0.9 ns - JMP SHORT
             1   ns - speed-of-light (a photon) travel a 1 ft (30.5cm) distance -- will stay, throughout any foreseeable future :o)
?~~~~~~~~~~~ 1   ns - MUL ( i**2 = MUL i, i )~~~~~~~~~ doing this 1,000 x is 1 [us]; 1,000,000 x is 1 [ms]; 1,000,000,000 x is 1 [s] ~~~~~~~~~~~~~~~~~~~~~~~~~
           3~4   ns - CPU L2  CACHE reference           (2020/Q1)
             5   ns - CPU L1 iCACHE Branch mispredict
             7   ns - CPU L2  CACHE reference
            10   ns - DIV
            19   ns - CPU L3  CACHE reference           (2020/Q1 considered slow on 28c Skylake)
            71   ns - CPU cross-QPI/NUMA best  case on XEON E5-46*
           100   ns - MUTEX lock/unlock
           100   ns - own DDR MEMORY reference
           135   ns - CPU cross-QPI/NUMA best  case on XEON E7-*
           202   ns - CPU cross-QPI/NUMA worst case on XEON E7-*
           325   ns - CPU cross-QPI/NUMA worst case on XEON E5-46*
|Q>~~~~~ 5,000   ns - QPU on-chip QUBO ( quantum annealer minimiser 1 Qop )
        10,000   ns - Compress 1K bytes with a Zippy PROCESS
        20,000   ns - Send     2K bytes over 1 Gbps  NETWORK
       250,000   ns - Read   1 MB sequentially from  MEMORY
       500,000   ns - Round trip within a same DataCenter
?~~~ 2,500,000   ns - Read  10 MB sequentially from  MEMORY~~(about an empty python process to copy on spawn)~~~~ x ( 1 + nProcesses ) on spawned process instantiation(s), yet an empty python interpreter is indeed not a real-world, production-grade use-case, is it?
    10,000,000   ns - DISK seek
    10,000,000   ns - Read   1 MB sequentially from  NETWORK
?~~ 25,000,000   ns - Read 100 MB sequentially from  MEMORY~~(somewhat light python process to copy on spawn)~~~~ x ( 1 + nProcesses ) on spawned process instantiation(s)
    30,000,000   ns - Read 1 MB sequentially from a  DISK
?~~ 36,000,000   ns - Pickle.dump() SER a 10 MB object for IPC-transfer and remote DES in spawned process~~~~~~~~ x ( 2 ) for a single 10MB parameter-payload SER/DES + add an IPC-transport costs thereof or NETWORK-grade transport costs, if going into [distributed-computing] model Cluster ecosystem
   150,000,000   ns - Send a NETWORK packet CA -> Netherlands
  |   |   |   |
  |   |   | ns|
  |   | us|
  | ms|

```

下图出自量化体系方法：

CPU寄存器: 容量1000字节，速度300ps
L1缓存: 64KB，速度1ns
L2缓存: 256KB，速度3-10ns
L3缓存: 2-4MB，速度10-20ns
主存储器: 4-16GB，速度50-100ns
磁盘存储: 4-16TB，速度5-10ms

参考：

[https://blog.csdn.net/konghhhhh/article/details/120463330](https://blog.csdn.net/konghhhhh/article/details/120463330)

[https://www.zhihu.com/question/488790905](https://www.zhihu.com/question/488790905)
