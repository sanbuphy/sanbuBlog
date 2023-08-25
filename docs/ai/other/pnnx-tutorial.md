---
title: PNNX 模型导出与基本信息读取——以Unet为例
---

kuiperinfer中使用的模型是PNNX，目前需要协助支持注册Unet网络的相关算子（已实现好），故需要先把模型进行导出，该文记录导出的全过程。

## PNNX 简介

详细见nihui姐姐的相关阐述，这里做部分摘抄。

简单来说，他是 PyTorch 模型部署的新的方式，可以避开 ONNX 中间商，导出比较干净的高层 OP

然后我们导出 ONNX 的时候，这里要明白 ONNX 并不是从 python 代码直接转到 ONNX，ONNX 导出时候是先通过导出 torchscript，然后从 torchscript ir 再转 ONNX。但是不一定能一对一op映射，onnx很多算子不天然支持，这会导致很多细碎op的出现，甚至不利于各种推理或者优化操作。

所以我们需要一个直觉上和工程上都更方便转换的IR格式，所以就有了PNNX，一个天然支持和pytorch语义一致和相互转换的模型格式。

## PNNX 导出示例

[https://github.com/pnnx/pnnx](https://github.com/pnnx/pnnx)

按照国际惯例先走一边官方教程。下载好对应的release文档后可以得到pnnx的二进制文件。

首先需要导出torchscript文件，再对他进行转换到pnnx格式：

```python
import torch
import torchvision.models as models

net = models.resnet18(pretrained=True)
net = net.eval()

x = torch.rand(1, 3, 224, 224)

# You could try disabling checking when tracing raises error
# mod = torch.jit.trace(net, x, check_trace=False)
mod = torch.jit.trace(net, x)

mod.save("resnet18.pt")
```

（这里建议新建一个文件夹在里面进行导出）保存后使用 ./pnnx  resnet18.pt 即可得到最后产物。

在这里我们只要关注.bin 和 .param即可，这些都会用相应的c++ api进行读取调用

我们可以通过Netron对导出后的模型进行查看，可以看到和原模型的语义一致。如果在pnnx导出的时候制定了输入的形状，你可以在Netron中看到每一个推导后的形状，反之你只能看到指定了输入和输出。

## PNNX调用示例

为了使用PNNX的函数进行转换后模型的验证，我们可以编译一个最小的查看程序（参考kuiperinfer中的实现）这里我把一个pnnx 的文件夹放在代编译源文件当中，然后导入需要的函数实现文件（需要用到ir.cpp的相关依赖），然后记得给torch带上链接（否则会出现一大堆undefine的错误，其中c17也是torchlib的依赖要求。），之后就可以顺利编译了。

CmakeLists:

```cpp
cmake_minimum_required(VERSION 3.0)
project(MyProject)
set(CMAKE_CXX_STANDARD 17)

set(CMAKE_PREFIX_PATH "${CMAKE_CURRENT_SOURCE_DIR}/libtorch" ${CMAKE_PREFIX_PATH})
find_package(Torch REQUIRED)
message(STATUS "Find TORCH_INCLUDE_DIRS: ${TORCH_INCLUDE_DIRS}")
find_package (glog 0.6.0 REQUIRED)

# 添加可执行文件
add_executable(read_pnnx read_pnnx.cpp ./pnnx/src/ir.cpp ./pnnx/src/storezip.cpp ./pnnx/src/utils.cpp)
target_link_libraries(read_pnnx ${TORCH_LIBRARIES})
target_link_libraries (read_pnnx glog::glog)

# 添加头文件目录
target_include_directories(read_pnnx PUBLIC ${TORCH_INCLUDE_DIRS})
target_include_directories(read_pnnx PUBLIC ${CMAKE_CURRENT_SOURCE_DIR})
target_include_directories(read_pnnx PUBLIC "pnnx/src/")
```

这里我还用到了glog方便处理。你如果想要安装可以自行按照glog官网教程进行安装：[https://github.com/google/glog](https://github.com/google/glog)  （注意，如果有conda需要先source deactivate 关闭 conda 才能进行编译，否则会出问题，因为conda 的库很多时候会污染编译。）

（如果你不想要glog只要把这个相关的依赖都去除就行了）

```cpp
#include "ir.h"
#include <string>
#include <iostream>
#include <memory>
#include <glog/logging.h>

static std::string PrintShape(const std::vector<int> &shapes){
    std::stringstream ss;
    for (auto i:shapes){
        ss<<i;
        ss<<" ";
    }
    return ss.str();
}

int main(){

    std::string bin_path("../UNet.pnnx.bin");
    std::string param_path("../UNet.pnnx.param");
    //std::unique_ptr<pnnx::Graph> graph = std::make_unique<pnnx::Graph>();
    std::unique_ptr<pnnx::Graph> graph{new pnnx::Graph()};
    int load_result = graph->load(param_path, bin_path);
    LOG_ASSERT(load_result==0);

    const auto& ops = graph->ops;
    for (int i = 0; i<ops.size(); i++){
        const auto& op = ops.at(i);
        //打印op的所有输入和输出
        std::cout << "\n";
        LOG(INFO) << "OP Name:" << op->name;
        for (int j = 0; j< op->inputs.size(); j++){
            LOG(INFO) << "Input name:" << op->inputs.at(j)->name<< " shape: " << PrintShape(op->inputs.at(j)->shape);
        }
        for (int j = 0; j< op->outputs.size(); j++){
            LOG(INFO) << "Ouput name:" << op->outputs.at(j)->name<< " shape: " << PrintShape(op->outputs.at(j)->shape);
        }
    }
    LOG(INFO) << "打印完毕！";
    return 0;
}
```

编译后运行你可以看到成功打印了pnnx文件的相关内容，和我们在netron中看到的一致。

## Unet导出

接下来进行Unet导出，这里进行投机取巧：

```Python
import torch

net = torch.hub.load('milesial/Pytorch-UNet', 'unet_carvana', pretrained=True, scale=0.5)
net.eval()
print(net)
x = torch.rand(1, 3, 224, 224)

print("start trace")
mod = torch.jit.trace(net, x, check_trace=False)

mod.save("UNet.pt")
```

保存后，依葫芦画瓢导出PNNX模型，然后把加载模型地址修改成对应unet模型即可，可以看到输出和netron里看到的结果一致。

## Reference

源码释放：[https://github.com/pnnx/pnnx](https://github.com/pnnx/pnnx)

可视化工具ncnn-editor：[https://github.com/scarsty/ncnn-editor](https://github.com/scarsty/ncnn-editor)

Windows/Linux/MacOS 编译 PNNX 步骤 - nihui的文章 - 知乎 [https://zhuanlan.zhihu.com/p/431833958](https://zhuanlan.zhihu.com/p/431833958)

PNNX: PyTorch Neural Network Exchange - nihui的文章 - 知乎 [https://zhuanlan.zhihu.com/p/427620428](https://zhuanlan.zhihu.com/p/427620428)

PNNX源码 :[https://github.com/Tencent/ncnn/tree/master/tools/pnnx](https://github.com/Tencent/ncnn/tree/master/tools/pnnx)
