---
title: opencv拓展包编译步骤-2022-11-13
---

建议使用默认安装cuda（包括驱动）以及ffmpeg的默认安装地址以免出现各种奇怪问题。

建议使用默认安装cuda（包括驱动）以及ffmpeg的默认安装地址以免出现各种奇怪问题。

```Bash
cmake .. -D CMAKE_BUILD_TYPE=RELEASE \
-D CMAKE_INSTALL_PREFIX=/usr/local \
-D ENABLE_PRECOMPILED_HEADERS=OFF \
-D INSTALL_C_EXAMPLES=OFF \
-D INSTALL_PYTHON_EXAMPLES=OFF \
-D BUILD_opencv_python2=OFF \
-D BUILD_opencv_python3=ON \
-D PYTHON_DEFAULT_EXECUTABLE=$(python3 -c "import sys; print(sys.executable)")   \
-D PYTHON3_EXECUTABLE=$(python3 -c "import sys; print(sys.executable)")   \
-D PYTHON3_NUMPY_INCLUDE_DIRS=$(python3 -c "import numpy; print (numpy.get_include())") \
-D PYTHON3_PACKAGES_PATH=$(python3 -c "from distutils.sysconfig import get_python_lib; print(get_python_lib())") \
-D WITH_TBB=ON \
-D BUILD_TBB=ON  \
-D ENABLE_FAST_MATH=1 \
-D CUDA_FAST_MATH=1 \
-D WITH_CUBLAS=1 \
-D WITH_V4L=ON \
-D WITH_LIBV4L=ON \
-D WITH_CUDA=ON \
-D WITH_CUDNN=ON \
-D WITH_GTK_2_X=ON \
-D WITH_NVCUVID=ON \
-D WITH_FFMPEG=ON  \
-D CUDA_ARCH_BIN=  8.6 \   #根据自己的显卡查找CUDA_ARCH_BIN表
-D OPENCV_EXTRA_MODULES_PATH=../../opencv_contrib/modules .




```

### 点亮ffmpeg

ffmepg有可能找不到，需要按照正规操作一遍ffmpeg。（记得whereis ffmpeg 删除相关内容）

### 点亮nvcuvid相关（在cuda那一行）

在官网申请下载好了sdk后运行：

```Bash
sudo cp Interface/*   /usr/include
sudo cp Lib/linux/stubs/x86_64/*    /usr/lib

```

删除build内内容重新cmake即可得到结果

> 如果这么尝试后你还是不能找到，你需要把include和lib的地址换成cuda的，如`/usr/local/cuda-11.5/lib64/` 以及 `/usr/local/cuda-11.5/include`
然后再依次cp，（我怀疑是因为cmake搜索路径和校验逻辑是直接利用cuda），这次你应该可以看见他了！

注：如果你想要卸载opencv 在原来的build文件中使用 `sudo make uninstall`即可！

> 值得注意的是，这样安装后装了一个python版本的tk2。0什么的（imshow报错的要求）后无法再次createReader。。。也许不能直接把sdk的拿过去?我们可以看看驱动安装的so然后拿到对应cuda的区域或者干脆重装一次驱动。。。。也许这是更好的方法。

## 跑samples测试

对于cpp的测试，参考下文

[https://zhuanlan.zhihu.com/p/357290528](https://zhuanlan.zhihu.com/p/357290528)

对于gpu里面的测试，你需要新建一个build，然后拖进你想要编译的文件，使用

```text
cmake_minimum_required(VERSION 3.0.2)
SET(CMAKE_BUILD_TYPE "Debug")
include_directories(include)
find_package( OpenCV REQUIRED )
include_directories( ${OpenCV_INCLUDE_DIRS} )
add_executable( test opencv_test.cpp )
target_link_libraries( test ${OpenCV_LIBS} )
```

其中注意`add_executable( test opencv_test.cpp )`需要修改为拖进来的文件。直接cmake . 即可得到结果。

## Reference

推荐阅读教程：

[https://blog.csdn.net/jiexijihe945/article/details/125084488](https://blog.csdn.net/jiexijihe945/article/details/125084488)

英文教程（内部有CUDA_ARCH_BIN表）

[https://www.nanguoyu.com/opencv4-5-1-gpu](https://www.nanguoyu.com/opencv4-5-1-gpu)

编译选项中ffmpeg路径修改

[https://blog.csdn.net/woainannanta/article/details/78260419](https://blog.csdn.net/woainannanta/article/details/78260419)

opencv读取rtsp网络流问题与优化方案

[https://blog.csdn.net/submarineas/article/details/110083906](https://blog.csdn.net/submarineas/article/details/110083906)

VPF：Python中的硬件加速视频处理框架

[https://blog.csdn.net/submarineas/article/details/111877262](https://blog.csdn.net/submarineas/article/details/111877262)

VPF使用范例

[https://blog.csdn.net/kkae8643150/article/details/123307662](https://blog.csdn.net/kkae8643150/article/details/123307662)

超级大全 实现基于Opencv的GPU视频编解码

[https://note.youdao.com/ynoteshare/index.html?id=700052b0a49301059a34f20a00a830ca&type=note&_time=1638503513531](https://note.youdao.com/ynoteshare/index.html?id=700052b0a49301059a34f20a00a830ca&type=note&_time=1638503513531)
