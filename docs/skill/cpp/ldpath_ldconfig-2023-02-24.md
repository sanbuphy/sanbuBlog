---
title: 编译器链接与ldconfig、LD_LIBRARY_PATH
---

总的来说，日常我们经常会遇到的动态库找不到问题，首先遇事不决ldd看依赖，然后丢到搜索路径（usr/lib等）即可。（cmake有问题就message出来看那个变量有问题。。。或者开调试strace等等）

什么是ldconfig，从linux man可以知道：

**ldconfig** creates the necessary links and cache to the most recent shared libraries found in the directories specified on the command line, in the file */etc/ld.so.conf*, and in the trusted directories (*/lib* and */usr/lib*). The cache is used by the **run-time linker**, [*ld.so*](http://ld.so) or [*ld-linux.so*](http://ld-linux.so). **ldconfig** checks the header and filenames of the libraries it encounters when determining which versions should have their links updated.

什么是**run-time linker**呢？

The programs ld.so and ld-linux.so* find and load the shared objects (shared libraries) needed by a program, prepare the program to run, and then run it.

## ldconfig与LD_PATH

（转自[https://www.cnblogs.com/my-show-time/p/15250435.html](https://www.cnblogs.com/my-show-time/p/15250435.html)

1、往/lib和/usr/lib里面加东西，是不用修改/etc/ld.so.conf文件的，但是添加完后需要调用下ldconfig，不然添加的library会找不到。

2、如果添加的library不在/lib和/usr/lib里面的话，就需要修改/etc/ld.so.conf文件，往该文件追加library所在的路径，然后也需要重新调用下ldconfig命令。或者在/etc/ld.so.conf.d/下添加*.conf的文件并追加library的路径，然后执行ldconfig。比如在安装MySQL的时候，其库文件/usr/local/mysql/lib，就需要追加到/etc/ld.so.conf文件中。命令如下：

```Bash
echo "/usr/local/mysql/lib" >>/etc/ld.so.conf
ldconfig -v | grep mysql
```

查看缓存文件所保存的所有共享库

`ldconfig -p`

3、如果添加的library不在/lib或/usr/lib下，且没有权限操作写/etc/ld.so.conf文件的话，这时只需要将路径放到LD_LIBRARY_PATH环境变更就可以了。

可以用命令 export****来临时生效

  `export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:/usr/local/lib`

以上做法，只是临时设置变量 LD_LIBRARY_PATH ，下次开机这个变量将失效；如何把这个值持续写到 LD_LIBRARY_PATH 里呢？

我们可以在 **~/.bashrc** 或者 **~/.bash_profile** 中加入 export 语句，前者在每次登陆和每次打开 shell 都读取一次，后者只在登陆时读取一次。我的习惯是加到 **~/.bashrc** 中.在该文件的未尾，可采用如下语句来使设置生效：

  `export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:/usr/local/lib`

以上是`bash`配置环境变量的格式`csh`的格式有所不同：

  `setenv LD_LIBRARY_PATH {LD_LIBRARY_PATH}:{my_HOME}/lib`

修改完后，记得关掉当前终端并重新打开一个新的终端，从而使上面的配置生效。

## 编译过程的搜索路径

转自：[https://mp.weixin.qq.com/s/MresJrkdnZ8iDGCP6WzR4Q](https://mp.weixin.qq.com/s/MresJrkdnZ8iDGCP6WzR4Q)

```Bash
# 去哪里找头文件 相当于gcc/clang 中的-I(i的大写字母)参数  

include_directories(${GTEST_INCLUDE_DIR})  

include_directories(${GMOCK_INCLUDE_DIR})  

# 去哪里找库文件 .so .dll .dylib 相当于gcc 中的-L参数  

link_directories(${GTEST_LINK_DIR})  

link_directories(${GMOCK_LINK_DIR})
```

尽管如此，设置成这种情况还是有时候找不到（还没有彻底解决和理解这个过程），这种情况下只要暴力的改变cmake的动态库搜索路径即可（比如直接在usr/local/lib中查找需要的某些动态库）

## 链接库的路径搜索顺序

以下来自linux man ld.so

If a shared object dependency does not contain a slash, then it
is searched for in the following order:

- Using the directories specified in the DT_RPATH dynamic
  section attribute of the binary if present and DT_RUNPATH
  attribute does not exist.  Use of DT_RPATH is deprecated.

- Using the environment variable **LD_LIBRARY_PATH**, unless the
  executable is being run in secure-execution mode (see below),
  in which case this variable is ignored.

- Using the directories specified in the DT_RUNPATH dynamic
  section attribute of the binary if present.  Such directories
  are searched only to find those objects required by DT_NEEDED
  (direct dependencies) entries and do not apply to those
  objects' children, which must themselves have their own
  DT_RUNPATH entries.  This is unlike DT_RPATH, which is applied
  to searches for all children in the dependency tree.

- From the cache file */etc/ld.so.cache*, which contains a
  compiled list of candidate shared objects previously found in
  the augmented library path.  If, however, the binary was
  linked with the **-z nodeflib** linker option, shared objects in
  the default paths are skipped.  Shared objects installed in
  hardware capability directories (see below) are preferred to
  other shared objects.

- In the default path */lib*, and then */usr/lib*.  (On some 64-bit
  architectures, the default paths for 64-bit shared objects are
  */lib64*, and then */usr/lib64*.)  If the binary was linked with
  the **-z nodeflib** linker option, this step is skipped.

转自：[https://zhuanlan.zhihu.com/p/458193070](https://zhuanlan.zhihu.com/p/458193070)

gcc在**编译时**按照如下顺序寻找所需要的库文件：

1. gcc会去找`-L`指定的目录
2. 再找gcc的环境变量`LIBRARY_PATH`
3. 再找内定目录

- /lib和/lib64
- /usr/lib 和/usr/lib64
- /usr/local/lib和/usr/local/lib64

这是当初编译 gcc 时写在程序内的。

这里有两个问题：

- 默认情况下，gcc编译时只会查找相应的头文件，而不会连接具体的lib。也就是说只要include设置完全，就可以编译通过。它没有进一步检查include中的类和函数有没有实现，而是在运行时才开始查找。所以就会经常发生编译可以通过，但运行时却无法运行，因为在运行时它找不到相关类或者函数的实现。

这时，使用`-Wl`,`--no-undefined`参数，如果使用了 include 文件，链接器却找不到相应的实现，就会产生错误提示。

- 编译时默认不查找当前目录，需要使用`-L ./`指定

**运行时**动态库的搜索路径的先后顺序是：

1. 编译目标代码时指定的动态库搜索路径；这是通过gcc的参数`-Wl,-rpath=`指定。当指定多个动态库搜索路径时，路径之间用冒号 ：分隔
2. 环境变量`LD_LIBRARY_PATH`指定的动态库搜索路径
3. 配置文件`/etc/ld.so.conf`中指定的动态库搜索路径
4. 默认的动态库搜索路径，如：`/lib`, `/usr/lib`
