---
title: 多进程/多线程/协程浅显介绍
---

比较早写的笔记和理解,可能有错误,具体还是看现代操作系统相关文档.

## 初识进程线程

### 什么是进程

**一个任务就是一个进程，是操作系统资源分配的基本单位。**  

进程是操作系统分配资源的基本单位，一个进程代表了一个正在运行的程序。每个进程有自己独立的地址空间、内存、数据栈以及其他用于跟踪执行的辅助数据。简单来说，一个任务就是一个进程。

例如，打开浏览器（如Chrome）、打开Word文档、运行游戏或者QQ，这些都是独立的任务，分别对应不同的进程。需要注意的是，同一种任务打开多个实例时，通常会创建多个进程。例如，打开多个Chrome标签页，实际在后台可能会启动多个Chrome进程。

重要的是，仅运行中的程序才能称为进程。未运行的程序只是一些存储在磁盘上的指令和数据的集合，并不能算作进程。

进程拥有以下特点：

- 独立的内存空间
- 独立的系统资源
- 自己的PID(进程ID)
- 可以包含多个线程
- 进程间通信需要特殊的IPC机制

### 什么是线程

**线程可以看作一个任务的各项子任务，是操作系统直接的执行单元。**  

线程是进程内的一个执行单元，是操作系统直接调度的基本单位。一个进程可以包含多个线程，这些线程共享进程的资源，如内存空间和文件描述符。线程可以看作是进程的子任务，它们共同完成一个更大的任务。

例如，在一个媒体播放器中，可能会有多个线程分别处理视频解码、音频解码、用户界面更新等任务。每个线程执行不同的功能，但共享同一个进程的资源。在一个进程中，至少存在一个线程，通常称为主线程，其他由主线程创建的称为子线程。

- 共享所属进程的内存空间
- 可以访问进程的资源
- 具有自己的栈空间
- 具有自己的线程ID
- 线程间通信相对简单，可以直接读写进程中的数据

### 小结

进程是资源分配的基本单位，具有独立的内存空间和资源。进程之间相互隔离，一个进程崩溃不会影响其他进程。
线程是执行的基本单位，属于进程的一部分，多个线程共享进程的资源。线程之间的通信更加高效，但一个线程的崩溃可能导致整个进程的失败。
操作系统的执行粒度是线程，资源分配的粒度是进程。在单核CPU上，通过线程的时间片轮转实现多任务；在多核CPU上，可以通过多进程和多线程同时利用多个核心。
需要注意的是，在Python中，由于**全局解释器锁（GIL）**的存在，多线程主要用于I/O密集型任务，而多进程更适合CPU密集型任务。

## 进程与线程的比较

### 进程的优缺点

多进程的优点是稳定性好，一个子进程崩溃了，不会影响主进程以及其余进程。
但是缺点是**创建进程的代价非常大** ，因为操作系统要给每个进程分配固定的资源，并且，操作系统对进程的总数会有一定的限制，若进程过多，**操作系统调度都会存在问题，会造成假死状态。**。不过，进程与进程之间是完全隔离的，进程A崩溃了完全不会影响到进程B。

### 线程的优缺点

多线程优点是效率较高一些，但是致命的缺点是**任何一个线程崩溃都可能造成整个进程的崩**溃，因为它们共享了进程的内存资源池，没有自己单独的内存地址空间，指针数据的错误可以导致任何同地址空间内其他线程的崩溃，包括进程。

## 深入理解进程与线程

### 进程

#### 进程的组成

当一个程序被载入内存并成为一个进程后，它会占用一部分存储空间，此空间会分为 4 个区域：

```
+-------------------+
|    Stack栈区域     |
+-------------------+
|                   |
|         ↑         |
|                   |
|                   |
|                   |
|         ↓         |
|                   |
+-------------------+
|    Heap堆区域      |
+-------------------+
|    Data数据区      |
+-------------------+
|    Text文本区      |
+-------------------+
```

这 4 个区域的作用分别是：
栈（Stack）：存储局部变量、函数参数等临时数据。
堆（Heap）：进程在执行期间可以动态申请这部分空间。
数据区（Data）：存储全局变量和静态变量。
文本区（Text）：存储进程要执行的机器指令代码。

```
#include <stdio.h>
#include <stdlib.h>

// Data区 - 全局变量
int globalVar = 100;
static int staticVar = 200;

// Text区 - 函数代码
void sampleFunction(int param) {  // param在Stack区
    // Stack区 - 局部变量
    int localVar = 300;
    
    // Heap区 - 动态分配的内存
    int* dynamicVar = (int*)malloc(sizeof(int));
    *dynamicVar = 400;
    
    printf("Global: %d\n", globalVar);
    printf("Local: %d\n", localVar);
    printf("Dynamic: %d\n", *dynamicVar);
    
    free(dynamicVar);
}

int main() {
    sampleFunction(500);
    return 0;
}
```

大概分布长这样:

```
+-------------------------+
|       Stack栈区域        | <- sampleFunction的参数param (500)
+-------------------------+ <- localVar (300)
|          ↑              |
|          |              |
|     未使用的空间          |
|          |              |
|          ↓              |
+-------------------------+
|       Heap堆区域        | <- dynamicVar指向的内存 (400)
+-------------------------+
|       Data数据区        | <- globalVar (100)
|                         | <- staticVar (200)
+-------------------------+
|       Text文本区        | <- main()函数的机器码
|                         | <- sampleFunction()的机器码
+-------------------------+
```

当程序运行时：

Text区存放了main()和sampleFunction()的机器码
Data区存放了globalVar和staticVar的值
调用sampleFunction时，参数和局部变量被压入Stack
malloc()在Heap区分配内存给dynamicVar指向

此外,这里常说 stack 向下生长,  heap 向上生长,这里如何看出? 弄一个 demo:

```
#include <stdio.h>
#include <stdlib.h>

int main() {
    // 观察栈的增长方向
    int stack1;
    int stack2;
    printf("栈变量1的地址: %p\n", (void*)&stack1);
    printf("栈变量2的地址: %p\n", (void*)&stack2);
    
    // 观察堆的增长方向
    int *heap1 = malloc(sizeof(int));
    int *heap2 = malloc(sizeof(int));
    printf("\n堆变量1的地址: %p\n", (void*)heap1);
    printf("堆变量2的地址: %p\n", (void*)heap2);
    
    free(heap1);
    free(heap2);
    return 0;
}
```

在online compile 可以看到结果

```
栈变量1的地址: 0x7ffffce0d07c
栈变量2的地址: 0x7ffffce0d078

堆变量1的地址: 0x40d6b0
堆变量2的地址: 0x40d6d0
```

这里向下向上是指内存的地址高低:

```
+-------------------+ 0xFFFF0000 (高地址)
|    Stack栈区域     |
+-------------------+ 0xFFFEF000
|         ↓         |
|                   |
|     未使用空间      |
|                   |
|         ↑         |
+-------------------+ 0x20001000
|    Heap堆区域      |
+-------------------+ 0x20000000
|    Data数据区      |
+-------------------+ 0x10000000
|    Text文本区      |
+-------------------+ 0x00000000 (低地址)
```

#### 用户进程地址空间

直接把物理地址暴露给进程会带来严重问题

如果用户程序可以寻址内存的每个字节，就有很大的可能破坏操作系统，造成系统崩溃
同时运行多个程序十分困难 地址空间创造了一个新的内存抽象，地址空间是一个进程可用于寻址内存的一套地址的集合。每个进程都有一个自己的地址空间，并且这个地址空间独立于其它进程的地址空间。使用基址寄存器和界限器可以实现。

内存管理单元（MMU）管理着地址空间和物理内存的转换，其中的页表（Page table）存储着页（程序地址空间）和页框（物理内存空间）的映射表。一个虚拟地址分成两个部分，一部分存储页面号，一部分存储偏移量。

简单来说:

```
物理内存
+------------------+ 0xFFFFFFFF
|      ...        |
+------------------+ 
|  进程1实际内存    | 0x4A761000
+------------------+
|      ...        |
+------------------+
|  进程2实际内存    | 0x8B234000
+------------------+
|      ...        |
+------------------+ 0x00000000

        ↑↓ 映射

进程1的虚拟内存视图
+------------------+ 0xFFFFFFFF
|     Stack       |
|        ↓        |
|                 |
|        ↑        |
|     Heap        |
|     Data        |
|     Text        |
+------------------+ 0x00000000

进程2的虚拟内存视图
+------------------+ 0xFFFFFFFF
|     Stack       |
|        ↓        |
|                 |
|        ↑        |
|     Heap        |
|     Data        |
|     Text        |
+------------------+ 0x00000000
```

#### 生命周期

进程的生命周期可以分为以下几个主要阶段：

创建（Creation）：操作系统通过执行fork()或spawn()等系统调用创建一个新进程，新进程会复制父进程的资源和内存空间。
就绪（Ready）：进程被创建后，进入就绪状态，等待操作系统调度执行。
运行（Running）：当操作系统选择该进程进行执行时，进程进入运行状态，占用CPU资源执行指令。
等待（Waiting/Blocked）：进程在等待某些资源或事件（如I/O操作完成）时，进入等待状态。
终止（Termination）：进程完成任务或因异常情况被终止，释放所有占用的资源。
整个生命周期涉及进程的创建、调度、执行、等待和销毁等多个环节，操作系统通过调度算法管理进程的状态转换，确保系统资源的合理利用。

线程的生命周期通常包括以下几个阶段：

新建（New）：线程对象被创建，但尚未启动。
就绪（Runnable）：线程已准备好运行，等待操作系统调度。
运行（Running）：线程获取CPU资源并开始执行。
阻塞（Blocked）：线程在等待某个事件或资源（如I/O操作完成、获取锁等）时，进入阻塞状态。
终止（Terminated）：线程完成任务或被强制终止，生命周期结束。
与进程相比，线程的生命周期管理更为轻量，线程间的切换和管理更加频繁，但也更需要注意同步和资源共享的问题。

### linux系统下进程线程的创建

在Linux内核中，进程和线程都由task_struct结构体表示。task_struct包含了进程/线程的各种信息，如进程状态、PID、父进程指针、内存管理信息等。实际上，Linux将线程视为共享特定资源（如内存空间）的轻量级进程（Light Weight Process，LWP）。

轻量级进程: 线程在Linux中被称为轻量级进程（Lightweight Process, LWP），它们与进程共享相同的地址空间和某些资源（如打开的文件描述符），但每个线程有自己的栈和程序计数器。这种设计使得线程的创建和上下文切换比进程更为高效。

当进程或线程需要执行特权操作（如访问硬件或执行系统调用）时，它们会从用户态切换到内核态。在内核态下，代码可以访问系统的所有资源，并执行特权指令。

在内核中，进程和线程的上下文切换是通过保存和恢复 task_struct 中的状态信息来实现的。这种机制确保了无论是进程还是线程，内核都能有效地管理它们的执行状态

通过clone()系统调用创建： 无论是创建新进程（通过fork()）还是创建新线程（通过pthread_create()），底层都依赖于clone()系统调用。fork()是clone()的一个封装，使用默认参数创建一个几乎与父进程完全独立的新进程。而pthread_create()则通过调用clone()并设置适当的标志来实现线程的创建，使新线程共享父线程的资源。

## python中的GIL全局解释器锁

**全局解释器锁（GIL，Global Interpreter Lock）**是Python（特别是CPython实现）中用于保护解释器内部数据结构，防止在多线程情况下出现竞争条件的机制。GIL确保任何时候只有一个线程在执行Python字节码，这意味着即使在多核处理器上，多个线程也无法实现真正的并行执行。
在Python多线程执行时,线程会轮流获得GIL锁,这使得Python的多线程特别适合I/O密集型任务(如网络请求、文件读写等),但不适合CPU密集型任务(如大量计算)。如果需要绕过GIL的限制,可以采用以下几种方法:使用多进程(multiprocessing)代替多线程、使用其他没有GIL的Python解释器(如Jython、IronPython)、或者使用C扩展来实现计算密集型的任务。
GIL 的存在使得多线程可以在没有复杂同步机制的情况下访问和修改对象，简化了解释器的实现，并有助于避免潜在的内存问题。与 Python 不同，Java 通过垃圾回收自动管理内存，其垃圾回收器允许多线程并发访问和修改对象，而不需要全局锁。
你也可以考虑最新的ptyhon,里面已经有了取消GIL的初步版本。

## 协程简介

除了多进程和多线程，**协程（Coroutine）**是Python中另一种实现并发的方式。协程是一种轻量级的执行单元，相比线程和进程，协程的创建和切换开销更小，适用于高并发的I/O密集型任务。

协程的特点
单线程内的并发：协程在单个线程内通过调度实现并发执行，不依赖于操作系统的线程管理。
非抢占式调度：协程切换由程序控制，通过await或yield等关键字主动让出控制权，避免了线程切换时的竞争条件。
高效的资源利用：由于协程的轻量级特性，可以同时运行大量协程，适合处理大量I/O操作。

Python中的协程
Python通过asyncio库提供了对协程的原生支持。使用async和await关键字，可以定义和调用异步函数，从而实现高效的并发编程。

```python
import asyncio

async def fetch_data(delay):
    print(f"Start fetching data with {delay} seconds delay")
    await asyncio.sleep(delay)
    print(f"Finished fetching data with {delay} seconds delay")
    return f"Data {delay}"

async def main():
    tasks = [
        asyncio.create_task(fetch_data(2)),
        asyncio.create_task(fetch_data(3)),
        asyncio.create_task(fetch_data(1)),
    ]
    results = await asyncio.gather(*tasks)
    print(results)

if __name__ == "__main__":
    asyncio.run(main())
```

输出结果：

```
Start fetching data with 2 seconds delay
Start fetching data with 3 seconds delay
Start fetching data with 1 seconds delay
Finished fetching data with 1 seconds delay
Finished fetching data with 2 seconds delay
Finished fetching data with 3 seconds delay
['Data 2', 'Data 3', 'Data 1']
```

在上面的示例中，三个协程几乎同时开始执行，通过await asyncio.sleep(delay)实现异步等待，不会阻塞主线程，最终并行完成任务并返回结果。

I/O密集型任务：协程和多线程都适用，但协程由于更低的资源开销和更高的并发效率，通常是更好的选择。
CPU密集型任务：多进程更适合，因为协程和多线程在GIL的限制下无法有效利用多核CPU的能力。

## 线程异常捕获

在多线程编程中，子线程中发生的异常不会直接传递到主线程，可能导致问题被忽视。因此，捕获子线程异常并进行适当处理是提高程序鲁棒性的关键。

方法一：在线程函数中捕获异常
最直接的方法是在子线程的执行函数中使用try-except块捕获异常，并通过某种方式（如队列）将异常传递到主线程。

```python
import threading
import queue

def worker(q):
    try:
        # 模拟一个异常
        1 / 0
    except Exception as e:
        q.put(e)

def main():
    q = queue.Queue()
    t = threading.Thread(target=worker, args=(q,))
    t.start()
    t.join()

    if not q.empty():
        exception = q.get()
        print(f"Caught exception from thread: {exception}")

if __name__ == "__main__":
    main()
```

output:
```Caught exception from thread: division by zero```

方法二：自定义线程类
通过继承threading.Thread并在子类中添加异常捕获和处理逻辑，可以更灵活地管理子线程的异常。

```python
import threading

class ExceptionThread(threading.Thread):
    def **init**(self, *args, **kwargs):
        super(ExceptionThread, self).**init**(*args,**kwargs)
        self.exception = None

    def run(self):
        try:
            if self._target:
                self._target(*self._args, **self._kwargs)
        except Exception as e:
            self.exception = e

def worker():
    # 模拟异常
    raise ValueError("An error occurred in thread")

def main():
    t = ExceptionThread(target=worker)
    t.start()
    t.join()

    if t.exception:
        print(f"Caught exception from thread: {t.exception}")

if __name__ == "__main__":
    main()
```

方法三：使用concurrent.futures模块
concurrent.futures.ThreadPoolExecutor提供了更高级的接口来管理线程，并且可以方便地处理异常。

```python
from concurrent.futures import ThreadPoolExecutor

def worker():
    # 模拟异常
    raise RuntimeError("Error in thread")

def main():
    with ThreadPoolExecutor(max_workers=2) as executor:
        future = executor.submit(worker)
        try:
            future.result()
        except Exception as e:
            print(f"Caught exception from thread: {e}")

if __name__ == "__main__":
    main()
```

concurrent.futures模块自动捕获子线程中的异常，并在调用future.result()时重新抛出，便于在主线程中处理。

## 查看个人电脑的最大进程、线程数

不同电脑的配置状况决定了一个系统能够运行多少进程以及对应的线程数，简单粗暴的方法是用实例代码来检测到底能运行多少进程和线程：（一般情况下不要过于离谱即可）
不过需要注意的是，不同任务处理所需要占用的内存和cpu使用率是不同的，需要具体情况具体分析，但通常情况下的使用不会出现大问题（除非你考虑到数据共享安全性，想让一组线程执行完后再启动下一轮，那就要根据实际情况设计最大线程并加上线程锁；等到获取到的这些数据处理后才能继续处理下一轮数据；或者使用大小限定队列与线程池）  

**多进程测试代码**
首先，你可以用这个语句（linux与mac）进行直接查看:``ubuntu> ps aux | wc -l``,如果查询失败或者想要看到更直观的结果可以使用以下代码：  

````
#!/usr/bin/python
 
import os
import sys
import re
import threading
import signal
import time
 
g_exit = 0
num  = 0
 
def sig_process(sig, frame):
 global g_exit
 g_exit = 1
 
def sub_process(data):
 while not g_exit:
  time.sleep(1)
  print data
 
def process():
 num = int(sys.argv[1])
 all_process = []
 
 for i in range(num):
  try:
   pid = os.fork()
  except:
   pid = -1
 
  if pid < 0:
   print 'error in fork'
   all_process.append(-1)
  elif 0 == pid:
   sub_process(i)
   os._exit(0)
  else:
   all_process.append(pid)
 
 while not g_exit:
  time.sleep(100)
 
 for i in range(num):
  if -1 == all_process[i]:
   continue
  os.waitpid(all_process[i], 0)
 
def main():
 if len(sys.argv) != 2:
  print 'wrong number parameter'
  return 0
 
 signal.signal(signal.SIGINT, sig_process)
 process()
 
if __name__ == '__main__':
 main()
````

**多线程测试代码**  

````
#!/usr/bin/python
 
import os
import sys
import re
import threading
import signal
import time
 
g_exit = 0
num  = 0
 
def sig_process(sig, frame):
 global g_exit
 g_exit = 1
 
def sub_process(data):
 while not g_exit:
  time.sleep(1)
  print data
 
def process():
 num = int(sys.argv[1])
 all_thread = []
 
 for i in range(num):
  try:
   td = threading.Thread(target = sub_process, args=(i,))
   td.start()
  except:
   all_thread.append(-1)
   continue
 
  all_thread.append(td)
 
 while not g_exit:
  time.sleep(100)
 
 for i in range(num):
  if isinstance(all_thread[i], int):
   continue
  all_thread[i].join()
 
def main():
 if len(sys.argv) != 2:
  print 'wrong number parameter'
  return 0
 
 signal.signal(signal.SIGINT, sig_process)
 process()
 
 
if __name__ == '__main__':
 main()
````

## Reference

- [Python多线程与多进程学习----概念](https://blog.csdn.net/soyabean555999/article/details/79108680)
- [操作系统，进程，线程](https://blog.csdn.net/weixin_43540515/article/details/114793287)
- [线程崩溃是否会造成进程崩溃](https://www.zhihu.com/question/22397613?sort=created)
- [python编程（你的电脑能够执行多少线程和进程）](https://blog.csdn.net/feixiaoxing/article/details/78565542)
- [python主线程捕获子线程异常](https://blog.csdn.net/weixin_45621200/article/details/120905195)
- [操作系统](https://www.biancheng.net/os/process.html)
