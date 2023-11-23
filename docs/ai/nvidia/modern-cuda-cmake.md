---
title: 现代cmake下运行cuda程序
keywords: ['nvidia']
---

主要是抛弃find而转向通用的set方法，具体参考了：

modern-cmake tutorial：
<https://cliutils.gitlab.io/modern-cmake/chapters/packages/CUDA.html>

Building Cross-Platform CUDA Applications with CMake:
<https://developer.nvidia.com/blog/building-cuda-applications-cmake/>

A good resource for CUDA and Modern CMake is [this talk](http://on-demand.gputechconf.com/gtc/2017/presentation/S7438-robert-maynard-build-systems-combining-cuda-and-machine-learning.pdf) by CMake developer Robert Maynard at GTC 2017.

## Adding the CUDA Language

There are two ways to enable CUDA support.

project(MY_PROJECT LANGUAGES CUDA CXX)

if CUDA is optional, you'll want to put this in somewhere conditionally:

enable_language(CUDA)
