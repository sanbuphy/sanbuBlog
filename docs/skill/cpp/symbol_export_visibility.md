---
title: 接口函数是否需要显式export关键字问题
---

## 背景

我一直很奇怪一个点，为什么对于windows的很多都需要显式指定导出导入函数，比如我们有这样的一个宏：

```
// C++头文件：mylibrary.h
#ifndef MYLIBRARY_H
#define MYLIBRARY_H

#ifdef _WIN32
    #ifdef MYLIBRARY_EXPORTS
        #define MYLIBRARY_API __declspec(dllexport)
    #else
        #define MYLIBRARY_API __declspec(dllimport)
    #endif
#else
    #define MYLIBRARY_API __attribute__((visibility("default")))
#endif

#ifdef __cplusplus
extern "C" {
#endif

MYLIBRARY_API void myExportedFunction(int arg);

#ifdef __cplusplus
}
#endif

#endif  // MYLIBRARY_H
```

为什么只有看到wendous上有很多人这么写，因为 —— win默认需要，需要你__declspec(dllexport)。
linux默认全部可见。当然默认值也一样可以改，cmake里面WINDOWS_EXPORT_ALL_SYMBOLS就是。

不过为了习惯，不建议随意修改符号可见性。static安全一点。

详细原因可参考：<https://www.zhihu.com/question/30301881>
windows下需要使用导出符号表（.def）文件（or 在.h里面使用__declspec(dllexport)自动生成.def）来链接dll才能让dll的符号表里有对应的符号，而在编译使用了dll的程序的时候也需要用那个.def文件（或者__declspec(dllimport)）来链接到dll文件上。不像linux下不需要指定这些你就可以正常的编译链接。原因是windows下你使用的是ms的链接器，ms的链接器是需要使用.def来寻找符号的，假如编译的时候没有.def文件那么默认就一个符号都不导出，并且没有.def文件也不能从dll中导入符号。而linux下你使用的gcc的链接器的行为就是正好反过来的，编译动态链接库的时候是默认把符号全部导出了，然后链接阶段也会自动从动态链接库中导入符号（因为导出的name里面是修改过的保存了函数的调用信息的）。

## 优点

除了符号的默认隐藏和显示问题，实际上也有一定的优化作用，对于windwos下，可参考微软编译器规范（加速）：
<https://learn.microsoft.com/en-us/cpp/build/importing-function-calls-using-declspec-dllimport?view=msvc-170>

<https://learn.microsoft.com/en-us/cpp/build/exporting-from-a-dll-using-declspec-dllexport?view=msvc-170&source=recommendations>

## 其他

对于这个涉及到符号管理，更复杂的问题，请参考：[C/C++符号隐藏与依赖管理](https://blog.eluvk.cn/%E6%91%98%E6%8A%84/2022/09/%E6%91%98%E6%8A%84c-c%E7%AC%A6%E5%8F%B7%E9%9A%90%E8%97%8F%E4%B8%8E%E4%BE%9D%E8%B5%96%E7%AE%A1%E7%90%86/)
