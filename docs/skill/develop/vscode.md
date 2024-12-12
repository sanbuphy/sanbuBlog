---
title: vscode疑难解答
---

由于vscode的各种设置也有点恶心.....在此记录各类可能会遇到的坑.

虽然如此,请你一定要默念VSCODE是真的简单,是真的简单,这样你就一定都能弄明白.

## C&C++

对于臭名昭著的c_cpp_properties.json，额外参数有以下几点：（都是例子

```json
"includePath":["${workspaceFolder}/**","/usr/local/cuda/include"],
```

如果你想看更多配置信息,可以在不同位置输入" " 然后会跳出自动补全（也会自动显示对应的意思）  

对于头文件引入,符号补全相关,我们可以在c_cpp_properties.json中修改： （以nvidia-cookbook内的cpp代码自动补全和头文件修复为例）

```json
{
    "configurations": [
        {
            "name": "Linux",
            "includePath": [
                "/usr/include",
                "/work/github/trt-samples-for-hackathon-cn/cookbook/include",
                "/usr/local/cuda/include"
            ],
            "defines": [],
            "compilerPath": "/usr/bin/gcc",
            "cStandard": "c17",
            "cppStandard": "gnu++14",
            "intelliSenseMode": "linux-gcc-x64"
        }
    ],
    "version": 4
}
```

为了在vscode中顺利查看STL容器的值，需要简单的配置一下launch.json。首先在运行与调试界面创建launch.json，随后在右下角找到创建配置，选择gdb生成然后创建对应的launch.json即可。其中可能需要填一下对应的二进制启动地址，之后只要随意调试就可以看到STL容器内的值了。

#### windows下的vscode设置

如果你想要在windows下环境进行基本的vscode开发(除了装很大的VS),你可以选择安装mingw gcc g++工具链,或者用scoop管理包进行相应库的安装.
以下已假设你装好工具链,直接给出需要的配置:

:::info
注意,你需要把下面涉及 `bin` 地址,以及`gdb g++`相关工具链的地址设置为你自己的默认地址.(本质是调用对应的可执行文件)

最重要的还是 c_cpp_properties.json ,其他配置理论可以自动生成.
:::

`c_cpp_properties.json`

```json
{
    "configurations": [
        {
            "name": "Win32",
            "includePath": [
                "${workspaceFolder}/**"
            ],
            "defines": [
                "_DEBUG",
                "UNICODE",
                "_UNICODE"
            ],
            "windowsSdkVersion": "10.0.17763.0",
            "compilerPath": "d:\\Program Files (x86)\\mingw64\\bin\\g++.exe",  // 此处指定自己安装的g++.exe地址
            "cStandard": "c11",
            "cppStandard": "c++11",
            "intelliSenseMode": "${default}",
            "configurationProvider": "ms-vscode.cmake-tools"
        }
    ],
    "version": 4
}
```

`launch.json`

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "(gdb) 启动",
            "type": "cppdbg",
            "request": "launch",
            "program": "${workspaceFolder}/build/cpp_learn",
            "args": [],
            "stopAtEntry": false,
            "cwd": "${workspaceFolder}",
            "environment": [],
            "externalConsole": false,
            "MIMode": "gdb",
            "setupCommands": [
                {
                    "description": "为 gdb 启用整齐打印",
                    "text": "-enable-pretty-printing",
                    "ignoreFailures": true
                },
                {
                    "description": "将反汇编风格设置为 Intel",
                    "text": "-gdb-set disassembly-flavor intel",
                    "ignoreFailures": true
                }
            ],
            "preLaunchTask": "Build",
            "miDebuggerPath": "d:\\Program Files (x86)\\mingw64\\bin\\gdb.exe"
        },
        {
            "name": "C/C++: g++.exe 生成和调试活动文件",
            "type": "cppdbg",
            "request": "launch",
            "program": "${fileDirname}\\build\\${fileBasenameNoExtension}.exe",
            "args": [],
            "stopAtEntry": false,
            "cwd": "d:\\Program Files (x86)\\mingw64\\bin",
            "environment": [],
            "externalConsole": false,
            "MIMode": "gdb",
            "miDebuggerPath": "d:\\Program Files (x86)\\mingw64\\bin\\gdb.exe",
            "setupCommands": [
                {
                    "description": "为 gdb 启用整齐打印",
                    "text": "-enable-pretty-printing",
                    "ignoreFailures": true
                },
                {
                    "description": "将反汇编风格设置为 Intel",
                    "text": "-gdb-set disassembly-flavor intel",
                    "ignoreFailures": true
                }
            ],
            "preLaunchTask": "C/C++: g++.exe 生成活动文件"
        }
    ]
}
```

`tasks.json`

```json
{
    "tasks": [
        {
            "type": "cppbuild",
            "label": "C/C++: g++.exe 生成活动文件",
            "command": "d:\\Program Files (x86)\\mingw64\\bin\\g++.exe",
            "args": [
                "-fdiagnostics-color=always",
                "-g",
                "${file}",
                "-o",
                "${fileDirname}\\build\\${fileBasenameNoExtension}.exe"  //如果你想要修改输出地址用这个就好
            ],
            "options": {
                "cwd": "d:\\Program Files (x86)\\mingw64\\bin"
            },
            "problemMatcher": [
                "$gcc"
            ],
            "group": {
                "kind": "build",
                "isDefault": true
            },
            "detail": "调试器生成的任务。"
        }
    ],
    "version": "2.0.0"
}
```

另外，如果你想让二进制编译产物都在一个指定地址（比如多个src文件，想要练习的结果都在一个目标文件夹，方便gitignore，你可以把上面的配置进行修改）：

`tasks.json` 的对应参数（主要是workspaceFolder，如果你不想生成一大堆编译产物可以把${fileBasenameNoExtension}换成一个名字即可

```json
            "args": [
                "-fdiagnostics-color=always",
                "-g",
                "${file}",
                "-o",
                "${workspaceFolder}/_build/${fileBasenameNoExtension}"
            ],
            "options": {
                "cwd": "${workspaceFolder}"
            },
```

`launch.json`的对应参数

```json
            "program": "${workspaceFolder}/_build/${fileBasenameNoExtension}",
            "args": [],
            "stopAtEntry": false,
            "cwd": "${workspaceFolder}",
```

### cmake

cmake的基础设置可参考:(需要先有个settings.json)

```json
{
    "cmake.cmakePath":"/home/cmake-3.16.0-Linux-x86_64/bin/cmake",
    "cmake.configureArgs":[
        "-DPY_VERSION=3.7",
        "-DWITH_GPU=OFF",
        #注意，在这里可以加入其他的cmake参数，只要是后续-D的都行
    ],
}
```

### gtest

如果在vscode中也想体会到clion单侧的快乐，首先需要安装两个插件：gtest mate和test Explorer UI，其次需要把对应单侧打包成可执行文件（可以每个都打包或者都打包在一个可执行文件

然后在settings.json中需要设定包含test可执行文件的路径，字段如下：(**用于匹配任意相关字符)

```json
    "testMate.cpp.test.executables": "这里是能找到可执行文件的地址，比如/home/test/build/**test**"
```

## Python

- 对于一些很多参数的怎么快速生成 launch.json 调试文件？———— `pip install zpdb` ，然后你只需要 zpdb + 命令就可以生成一个拥有完全参数的调试 launch.json 了！！！！（太强了）

- 如何执行文件夹自目录下的子文件夹内的python文件

[https://zhuanlan.zhihu.com/p/458657777](https://zhuanlan.zhihu.com/p/458657777)

- 常用的调试 launch.json配置：

```JSON
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Python: 当前文件",
            "type": "python",
            "request": "launch",
            "program": "${file}",
            "console": "integratedTerminal",
            "justMyCode": false,
            "cwd": "${fileDirname}", //这个的意思是在当前路径下开始调试，当前文件的执行路径下而不是工作区
            // "cwd": "${workspaceFolder}"  这个的意思是当前文件所在文件夹下开始调试
            "args": ["--config_path=./configs/ppyoloe_l_qat_dis.yaml","--save_dir='./quant_yoloel_output/'"], //加入一些运行的参数
        }
    ]
}
```

注意，如果运行的脚本在某个文件夹内，但是参数引用的文件在上一个地方的文件夹（比如调试tools/traing.py）可以这么写：

```JSON
"args": ["-c=../configs/ppyoloe/ppyoloe_crn_l_300e_coco.yml",
        "--slim_config=../configs/slim/quant/ppyoloe_l_qat.yml"],
```

- 自动格式化python代码  

首先安装google的格式化程序：`pip install yapf`

然后键入`ctrl+shift+p`然后输入`settings`往下找到用户的json，如果你是WSL的话就要找到对应WSL的config，然后输入`"python.formatting.provider": "yapf"`。之后只要使用`Alt+shift+F`即可格式化整体的python项目代码。

## 优雅Git

利用vscode 快速使用git：

1. 可以利用vscode很容易登录远程的github仓库。（记得网络要科学）
2. 然后记得添加远程库（选择你的对应仓库，切记最后的远程名不是仓库名，你可以选一个好写的比如remote）
3. 然后你需要添加一下邮箱和name信息，之后就可以愉快的使用各类命令了
4. ！！！！切记要先切换到对应的分支操作，否则回滚很麻烦。
5. 之后在终端还是在vscode gui都是可以很愉快的使用git操作

遇事不决(确保备份了当前文件)：

git reset --hard origin/master

## 其他

- VSCode代码自动补全太慢

（可参考：<https://blog.csdn.net/dddgggd/article/details/129105715>
首先左下角点开设置，搜索quick suggestions delay
然后改成5以内就飞快。

- vscode怎么多行标签栏而不是自己在那滚动？

可参考：<https://www.onlinevideoconverter.com/zh/video-converter>
搜索首先左下角点开设置，搜索workbench.edit.wrapTabs勾选即可。

- vscode插件开发指南

<https://github.com/microsoft/vscode-extension-samples>

- vscode + proxy

你可能经常会遇到在 vscode 中使用git同步遇到网络的问题，这时候你只需要搜索设置 proxy，然后根据本地监听的proxy设置一个对应的地址即可。

- remote ssh 链接失败，一直在链接中，和 install 对应服务器初始化中，看linux中的日志有类似以下问题报错：

```
thread 'tokio-runtime-worker' panicked at src/util/http.rs:298:24:
expected initresponse as first message from delegated http
```

解决方案： For now, setting "remote.SSH.useExecServer": false is required.

## 优雅的调试

- 如何顺利看调用过程然后自己增加log？————使用调用堆栈。

- 如何知道自己当前所在区域的“父类”是什么（比如某个函数属于那个类别），不需要拉动框，配合上面标题栏下方的索引即可（比如modules>script.py>load_module），也可以结合大纲判断。

- 如何让 vscode 也能够像 pycharm 之类的一样将变量信息显示在旁边？—— 设置中搜索 `inline values` 并显式指定为 `on` 即可。

## 推荐的插件

- Compare Folders插件，安装后，选择两个文件夹右键然后再选择最后一个英文的比较，可以对两个文件夹的区别进行比较。

## 推荐学习文章

[vscode一键配置C/C++多个C及CPP文件编译与tasks.json和launch.json原理](https://cloud.tencent.com/developer/article/2146749)

详细讲解了tasks和launch的参数和作用，以及简单的cmake写法

## clion一些坑备注

不想写新的文章。。clion的问题也顺便记在这里了：
clion 使用远程工具链，遇到类似这样的错误怎么办：（实际上是控制台输出编码问题）  

```
make[3]: *** [CMakeFiles/singlestudy.dir/build.make:154锛欳MakeFiles/singlestudy.dir/yushiqi_c++_lab/lab1.cpp.o] 閿欒 1
make[2]: *** [CMakeFiles/Makefile2:76锛欳MakeFiles/singlestudy.dir/all] 閿欒 2
make[1]: *** [CMakeFiles/Makefile2:83锛欳MakeFiles/singlestudy.dir/rule] 閿欒 2
make: *** [Makefile:129锛歴inglestudy] 閿欒 2

```

你只需要找到设置-编辑器-常规-控制台-找到默认编码修改成UTF-8，然后世界就清净了。

clion 编译 cuda文件记得cmake要带上：
`-DCMAKE_CUDA_ARCHITECTURES:STRING=86 -DCMAKE_CUDA_COMPILER:FILEPATH=/usr/local/cuda/bin/nvcc`

如何调试 cuda 程序？

1. 修改gdb为cuda-GDB
2. cmake加入-g -G
