---
title: Linux gcc/g++链接编译顺序详解
---

转载：<https://www.cnblogs.com/zhanggaofeng/p/9255668.html>

## 省流

在项目开发过层中尽量让lib是垂直关系，避免循环依赖；越是底层的库，越是往后面写！
例如:

`g++ ... obj($?) -l(上层逻辑lib) -l(中间封装lib) -l(基础lib) -l(系统lib) -o $@`

## gcc/g++链接时对库的顺序要求

```

-Ldir
    Add directory dir to the list of directories to be searched for -l.

-llibrary
-l library
    Search the library named library when linking. (The second
    alternative with the library as a separate argument is only for POSIX
    compliance and is not recommended.)

    It makes a difference where in the command you write this option;
    the linker searches and processes libraries and object files in
    the order they are specified. Thus, `foo.o -lz bar.o' searches
    library `z' after file foo.o but before bar.o. If bar.o refers to
    functions in `z', those functions may not be loaded.

    The linker searches a standard list of directories for the
    library, which is actually a file named liblibrary.a. The linker
    then uses this file as if it had been specified precisely by name.

    The directories searched include several standard system
    directories plus any that you specify with -L.

    Normally the files found this way are library files—archive files
    whose members are object files. The linker handles an archive file
    by scanning through it for members which define symbols that have
    so far been referenced but not defined. But if the file that is
    found is an ordinary object file, it is linked in the usual
    fashion. The only difference between using an -l option and
    specifying a file name is that -l surrounds library with `lib' and
    `.a' and searches several directories.    
```

以上来源于gcc手册

### 对于library的查找

查找需要连接的符号名是从前向后找，根据-L指定的路径顺序查找；不同 目录下的同名的库，只取第一个（从左向右），后面同名库被忽略；

### 对于符号的查找

从左向右查找，如果是主程序块和静态库，不能定位地址就报错： ‘undefined reference to: xxx’如果是链接成动态库，则假设该符号在load 的时候地址重定位。如果找不到对应的动态库，则会在load的时候报：“undefined symbol: xxx“这样的错误。

### –as-needed对链接动态库的影响

gcc-4.6默认开启ld的–as-needed选项。

```

--as-needed
--no-as-needed
    This option affects ELF DT_NEEDED tags for dynamic libraries mentioned on the command line after the --as-needed
    option.  Normally the linker will add a DT_NEEDED tag for each dynamic library mentioned on the command line,
    regardless of whether the library is actually needed or not.  --as-needed causes a DT_NEEDED tag to only be emitted for
    a library that satisfies an undefined symbol reference from a regular object file or, if the library is not found in
    the DT_NEEDED lists of other libraries linked up to that point, an undefined symbol reference from another dynamic
    library.  --no-as-needed restores the default behaviour.

--add-needed
--no-add-needed
    These two options have been deprecated because of the similarity of their names to the --as-needed and --no-as-needed
    options.  They have been replaced by --copy-dt-needed-entries and --no-copy-dt-needed-entries.

--copy-dt-needed-entries
--no-copy-dt-needed-entries
    This option affects the treatment of dynamic libraries referred to by DT_NEEDED tags inside ELF dynamic libraries
    mentioned on the command line.  Normally the linker won't add a DT_NEEDED tag to the output binary for each library
    mentioned in a DT_NEEDED tag in an input dynamic library.  With --copy-dt-needed-entries specified on the command line
    however any dynamic libraries that follow it will have their DT_NEEDED entries added.  The default behaviour can be
    restored with --no-copy-dt-needed-entries.

    This option also has an effect on the resolution of symbols in dynamic libraries.  With --copy-dt-needed-entries
    dynamic libraries mentioned on the command line will be recursively searched, following their DT_NEEDED tags to other
    libraries, in order to resolve symbols required by the output binary.  With the default setting however the searching
    of dynamic libraries that follow it will stop with the dynamic library itself.  No DT_NEEDED links will be traversed to
    resolve symbols.
```

--以上来源于man手册

```
--add-needed                Set DT_NEEDED tags for DT_NEEDED entries in   following dynamic libs
--no-add-needed             Do not set DT_NEEDED tags for DT_NEEDED entries   in following dynamic libs
--as-needed                 Only set DT_NEEDED for following dynamic libs if used
--no-as-needed              Always set DT_NEEDED for following dynamic libs

```

as-needed，意思大概是：只给用到的动态库设置DT_NEEDED。
例如：

g++ -shared a.o -ltest1 -lxxx -lrt -o libtest2.so
当链接生成libtest2.so的时候，如果libtest2.so里面用到了libtest1.so，但是没有用到libxxx.so。  
当开启–as-needed选项的时候，就不会链接libxxx.so文件
–as-needed就是忽略链接时没有用到的动态库，只将用到的动态库set NEEDED。  

## 常见错误

1.链接主程序模块或者是静态库的时的‘undefined reference to: xxx’

g++ -Wl,--as-needed -ltest1 -lc -lm -ldl -lpthread -L/home/ocaml/lib/ -lrt -o app main.o
假设main.o依赖libtest1.so中的东西。因为gcc对库的顺序要求（gcc编译时，由左向右）和–as-needed选项的开启（因为libtest1.so在main.o的左边，

所以gcc认为没有使用到它，–as-needed将其忽略），ld忽略libtest1.so，定位main.o的符号的时候当然会找不到符号的定义。

所以会出现‘undefined reference to’这个错误！

正确写法是：是写在左边：

g++ -Wl,--as-needed main.o -ltest1 -lc -lm -ldl -lpthread   -L/home/ocaml/lib/  -lrt -o app

2.编译动态库（shared library）的时候会导致一个比较隐晦的错误

编译出来的动态库的时候没有问题，但是加载的时候有“undefined symbol: xxx”这样的错误。假如像这也链接PyGalaxy.so

g++ -shared -Wl,--as-needed -lGalaxyParser -lc -lm -ldl -lpthread -L/home/ocaml/lib/ -lrt -o PyGalaxy.so PyGalaxy.o
load PyGalaxy.so的时候会有上面的运行时错误!

简单分析原因：因为libGalaxyParser.so在mutex.o的左边，所以gcc认为没有用到它，–as-needed将其忽略。但是前面说的动态库符号解析的特点导 致ld认为某些符号是加载的时候才去地址重定位的。但是 libGalaxyParser.so已经被忽略了。所以就算你写上了依赖的库，load的时 候也会找不到符号。但是为什么没有-Wl–as-needed的时候是正确的呢？没有的话，ld会set NEEDED libGalaxyParser.so（用前面提到的查看动态库依赖关系的办法可以验证）。load的时候还是可以找到符号的，所以正确。

正确的链接方式是：

g++ -shared -Wl,--as-needed PyGalaxy.o -lGalaxyParser -lc -lm -ldl -lpthread -L/home/ocaml/lib/ -lrt -o PyGalaxy.so
