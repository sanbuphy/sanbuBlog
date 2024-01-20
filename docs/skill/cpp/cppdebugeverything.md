---
title: c++ python联合调试大全
---

## 提前准备

### Vscode

首先安装插件 `Python C++ Debugger`,然后在launch.json中如此这般即可：

```
{
    "configurations": [
    {
        "name": "Python C++ Debugger",
        "type": "pythoncpp",
        "request": "launch",
        "pythonConfig": "default",
        "cppConfig": "default (gdb) Attach"
    }
    ]
}
```

## C/C++官方扩展

注意这个不是Cython，Cython是Python编程语言和扩展的Cython编程语言（基于Pyrex）的优化静态编译器。（第三方工具），是Python语言的超集，支持在变量和类属性上调用C函数和声明C类型。这使得编译器能够从Cython代码生成非常高效的C代码。该C代码仅生成一次，然后与CPython 2.6、2.7（使用Cython 0.20.x的2.4+版本）以及3.5和所有后续版本的所有主要C/C++编译器一起编译。

我个人不太喜欢 Cython，感觉多了一门语言，不如直接官方拓展，详细文档可参考：<https://cython.org/>

注：CPython is a Python Interpreter written in Python.
Cython is a C extension of Python. Cython is really a different programming language, and is a superset of both C and Python.

以下介绍的是python官方支持的C/C++ 的扩展方法，参考<https://docs.python.org/zh-cn/3/extending/extending.html>

```
如果你会用 C，添加新的 Python 内置模块会很简单。以下两件不能用 Python 直接做的事，可以通过 extension modules 来实现：实现新的内置对象类型；调用 C 的库函数和系统调用。

为了支持扩展，Python API（应用程序编程接口）定义了一系列函数、宏和变量，可以访问 Python 运行时系统的大部分内容。Python 的 API 可以通过在一个 C 源文件中引用 "Python.h" 头文件来使用。

扩展模块的编写方式取决与你的目的以及系统设置
```

一些扩展案例可参考 <https://blog.csdn.net/baidu_40840693/article/details/104136179>

这里建议 C 用 Ctypes，C++用pybind或者这个extension，就别cython了。接下来我们给出例子和debug方法。

## Pybind11

## NVCC

## 非sudo权限调试
