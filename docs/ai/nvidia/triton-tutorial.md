---
title: 从零开始使用NVIDIA-Triton
---

## 零、写在开头

写在开头：除了官方文档，特别感谢这位兄弟的相关博客：[https://www.cnblogs.com/zzk0/p/15487465.html](https://www.cnblogs.com/zzk0/p/15487465.html)   学到了很多（本文搬运组装了）

首先知道我们可以掌握triton的什么功能（参考zzk0的笔记）

- 支持多种深度学习框架的backend，Tensorflow，Pytorch，可通过实现后端 API 来进行扩展。

- 配置 Instance Groups，设置在不同的设备上运行多少个实例。

- HTTP/gRPC 协议。提供 C API，可以将 Triton 和应用连接起来。

- Scheduling And Batching，可以设置 dynamic batching，preferred batch sizes，排队等待时间，是否保持请求顺序返回，排队优先级，排队策略等。

- Metrics GPU 使用率，服务器吞吐量，服务器延时。

- 模型仓库，支持本地、云存储。

- 模型配置，设置后端、最大 batch size，输入输出，支持自动生成模型配置。

- Rate Limiter，控制请求调度到不同模型实例的频率。

- Model Warmup。避免头几次请求因为 lazy 初始化导致的延迟。

- 模型热更新，检测模型仓库。

- Repository Agent，扩展模型在加载和卸载时候的操作，比如加密、解密、转换、检测 checksum。

- Stateful Models，多个请求可以路由到同一个模型实例，从而模型的状态可以正确被更新。

- 模型 pipelines。多个模型一起完成推理任务。

- Performance Analyzer，性能分析器。

- Model Analyzer，使用 Performance Analyzer 分析测量一个模型的 GPU 内存和计算使用率。

- 共享内存，甚至显存！客户端和 Triton 之间可以共享内存，从而提高性能。

## 一、入门

triton作为一个一个高性能服务推理调度框架，具体细节就不多阐述，我们直接来看看可以怎么直接跑一个程序，这里由于我使用的是NGC就直接省去过程。

注意，如果你使用NGC，请拉取对应驱动版本的NGC（如果不确定就拉取早的版本），对于最新的NGC需要驱动cuda支持12.1

### 1.1 配置模型文件夹

我们可以在随意地点建立存放模型的文件夹，比如：`/home/sanbu/triton/model_repository/`

随后我们需要建立类似这样组织的文件：（注意，1表示版本，放在内部的模型名必须叫做model）

```Plain Text
model_repository
|
+-- resnet50
    |
    +-- config.pbxt
    +-- 1
        |
        +-- model.plan
```

其中config.pbxt需要按照下列格式书写：（注意，这里的name需要和上面的文件夹一致）

```Plain Text
name: "resnet50"
platform: "tensorrt_plan"
max_batch_size : 0
input [
  {
    name: "input"
    data_type: TYPE_FP32
    dims: [ 3, 224, 224 ]
    reshape { shape: [ 1, 3, 224, 224 ] }
  }
]
output [
  {
    name: "output"
    data_type: TYPE_FP32
    dims: [ 1, 1000 ,1, 1]
    reshape { shape: [ 1, 1000 ] }
  }
]
```

### 1.2 启动镜像

```Shell
docker run --gpus all -p8000:8000 -p8001:8001 -p8002:8002 \
 -v /home/sanbu/triton/model_repository/:/models \
 nvcr.io/nvidia/tritonserver:23.06-py3 \
 tritonserver \
 --model-repository=/models 
```

如果你看到对应模型出现了READY的相关字眼以及下方顺利出现了8000,8001等监听字样，就代表你成功启动了triton。你可以用下列方式检查服务是否正常：

```Shell
curl -v localhost:8000/v2/health/ready
```

如果有问题，你需要在启动triton的s时候进行--log-verbose=1查看所有日志。

### 1.3 执行推理

首先安装依赖

```Shell
pip install torchvision
pip install attrdict
pip install nvidia-pyindex
pip install tritonclient[all]
```

随后直接运行相关代码即可推理成功：（这个是官方例子，你需要更改为自己的模型例子，可以直接随便导出一个plan即可。注意要修改class_count参数（表示获取 topN 分类结果））

```Python
import numpy as np
from torchvision import transforms
from PIL import Image
import tritonclient.http as httpclient
from tritonclient.utils import triton_to_np_dtype

def rn50_preprocess(img_path="img1.jpg"):
    img = Image.open(img_path)
    preprocess = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])
    return preprocess(img).numpy()

transformed_img = rn50_preprocess()

# Setup a connection with the Triton Inference Server.
triton_client = httpclient.InferenceServerClient(url="localhost:8000")

# Specify the names of the input and output layer(s) of our model.
test_input = httpclient.InferInput("input", transformed_img.shape, datatype="FP32")
test_input.set_data_from_numpy(transformed_img, binary_data=True)

test_output = httpclient.InferRequestedOutput("output", binary_data=True, class_count=1000)

# Querying the server
results = triton_client.infer(model_name="resnet50", inputs=[test_input], outputs=[test_output])
test_output_fin = results.as_numpy('output')

print(test_output_fin[:5])
```

对于客户端triton_client库的使用，这里还有一段其他常见api：（同样感谢这位博主：[https://www.cnblogs.com/zzk0/p/15543824.html](https://www.cnblogs.com/zzk0/p/15543824.html)

```Python
import tritonclient.http as httpclient

if __name__ == '__main__':
    triton_client = httpclient.InferenceServerClient(url='127.0.0.1:8000')

    model_repository_index = triton_client.get_model_repository_index()
    server_meta = triton_client.get_server_metadata()
    model_meta = triton_client.get_model_metadata('resnet50_pytorch')
    model_config = triton_client.get_model_config('resnet50_pytorch')
    statistics = triton_client.get_inference_statistics()
    shm_status = triton_client.get_cuda_shared_memory_status()
    sshm_status = triton_client.get_system_shared_memory_status()
    
    server_live = triton_client.is_server_live()
    server_ready = triton_client.is_server_ready()
    model_ready = triton_client.is_model_ready('resnet50_pytorch')

    # 启动命令: ./bin/tritonserver --model-store=/models --model-control-mode explicit --load-model resnet50_pytorch
    # Triton 允许我们使用客户端去加载/卸载模型
    triton_client.unload_model('resnet50_pytorch')
    triton_client.load_model('resnet50_pytorch')
    
    triton_client.close()

    with httpclient.InferenceServerClient(url='127.0.0.1:8000'):
        pass
```

## 二、进阶内容

### 2.1 命令行参数

[https://www.cnblogs.com/zzk0/p/15932542.html](https://www.cnblogs.com/zzk0/p/15932542.html)

特别注释：

在启动 `tritonserver` 的时候，带上选项 `--model-control-mode=poll` 就可以启动模型热更新了。另外还可以指定 `--repository-poll-secs` 设置轮询模型仓库的时间。

### 2.2 model-warmup

参考[https://www.cnblogs.com/zzk0/p/15538894.html](https://www.cnblogs.com/zzk0/p/15538894.html)

```Plain Text
model_warmup  [
  {
    name: "random_input"
    batch_size: 1
    inputs: {
      key: "INPUT0"
      value: {
        data_type: TYPE_FP32
        dims: [224, 224, 3]
        random_data: true
      }
    }
  }
]
```

### 2.3 集联模型

一个集成模型（ensemble models）代表着一个pipeline，集成模型用于封装一个多模型的推理过程，例如“数据预处理->推理->数据后处理”。集成模型在外部来看被视作单个模型。

使用集成模型的目的在于节省中间过程的张量的传输，并最大限度减少必须发送到Triton的请求数量。

集成调度器（ensemble scheduler）必须用于集成模型，无论集成种的模型使用何种调度器。“一个”集成模型并不是一个真实的模型。实际上它规定了集成模型中各个模型之间的数据流向，这个数据流向以 “*ModelEnsembling::Step*”的形式定义在模型配置中。调度器在每一个“step”收集输出的tensors，并将这些tensors以输入的形式供下游模型使用。

集成模型会继承所涉及的模型的特征，因此request header中的“meta-data”必须符合集成模型内部的模型的输入要求。例如，如果一个模型是有状态模型，那么给集成模型的推理请求必须包含符合上述的有状态模型的信息，这些信息会被有状态调度器提供给有状态模型。

一个集成模型的模型配置如下，包含了图像识别与分割的集成：

```Plain Text
name: "ensemble_model"
platform: "ensemble"
max_batch_size: 1
input [
  {
    name: "IMAGE"
    data_type: TYPE_STRING
    dims: [ 1 ]
  }
]
output [
  {
    name: "CLASSIFICATION"
    data_type: TYPE_FP32
    dims: [ 1000 ]
  },
  {
    name: "SEGMENTATION"
    data_type: TYPE_FP32
    dims: [ 3, 224, 224 ]
  }
]
ensemble_scheduling {
  step [
    {
      model_name: "image_preprocess_model"
      model_version: -1
      input_map {
        key: "RAW_IMAGE"
        value: "IMAGE"
      }
      output_map {
        key: "PREPROCESSED_OUTPUT"
        value: "preprocessed_image"
      }
    },
    {
      model_name: "classification_model"
      model_version: -1
      input_map {
        key: "FORMATTED_IMAGE"
        value: "preprocessed_image"
      }
      output_map {
        key: "CLASSIFICATION_OUTPUT"
        value: "CLASSIFICATION"
      }
    },
    {
      model_name: "segmentation_model"
      model_version: -1
      input_map {
        key: "FORMATTED_IMAGE"
        value: "preprocessed_image"
      }
      output_map {
        key: "SEGMENTATION_OUTPUT"
        value: "SEGMENTATION"
      }
    }
  ]
}
```

配置中“ensemble*scheduling”部分表示集成模型调度器会使用三种不同的模型。“step”中的每个元素规定了使用什么模型，模型的输入输出是什么，这些map会被调度器识别。例如，“step”中第一个的元素规定了“image_*preprocess_model”使用的是最新的版本，它的输入“RAW_IMAGE”由“IMAGE”tensor提供，它的输出“PREPROCESSED_OUTPUT”映射为“preprocessd_image”tensor后续使用。

由多模型组成的集成模型也可以使用动态攒batch。如果集成模型中的模型只使用集成模型内部的数据，Triton可以将请求带入集成模型，而无需显式修改模型的配置以利用动态攒batch功能。

当集成模型收到一个推理请求，集成调度器会进行：

1. 识别request中的“IMAGE”tensor映射到预处理模型的输入“RAW_IMAGE”。

2. 检查集成中的模型并向预处理模型发送内部请求，由于所需输入tensor依旧准备好了。

3. 识别内部请求的完成，收集输出张量并将内容映射到“preprocessed_image”中（名字在集成中唯一）。

4. 将新收集的张量映射到集成中模型的输入。“classification_model”与“segmentation_model”的输入将被标记为就绪。

5. 检查需要新收集的张量的模型，并将内部请求发送到输入准备就绪的模型，此处为分类与收割模型。需要注意的是，响应的顺序是任意的，具体取决于各个模型的负载和计算时间。

6. 重复3-5步，直到不应发送更多的内部请求，使用映射到集成输出名称的张量来响应request。

除此外，你也可以参考 [Triton 搭建 ensemble 过程记录](https://www.cnblogs.com/zzk0/p/15517120.html)

但是，Ensemble Model不能解决一切问题，比如控制流，所以这时候你需要尝试python backend [https://www.cnblogs.com/zzk0/p/15535828.html](https://www.cnblogs.com/zzk0/p/15535828.html)   [https://github.com/zzk0/triton/tree/master/face/face_ensemble_python](https://github.com/zzk0/triton/tree/master/face/face_ensemble_python)，为了确保集联性能最大化以及前后处理性能最大化，你也可以用 c++ backend

>

### 2.4 性能度量与优化

你可以参考官方的优化文档

[https://docs.nvidia.com/deeplearning/triton-inference-server/user-guide/docs/user_guide/optimization.html](https://docs.nvidia.com/deeplearning/triton-inference-server/user-guide/docs/user_guide/optimization.html)

再次感谢：[https://www.cnblogs.com/zzk0/p/15543824.html](https://www.cnblogs.com/zzk0/p/15543824.html)

获取数据的方式：

- metrics，Triton 以 Prometheus 的格式将测量的数据暴露出来。[文档](https://github.com/triton-inference-server/server/blob/64975185d58ddf8a9d1fe83b5d2104286c8ab45f/docs/user_guide/metrics.md?plain=1#L29)

Metrics 提供了四类数据：GPU 使用率；GPU 内存情况；请求次数统计，请求延迟数据。其中 GPU 使用情况是每个 GPU 每秒的情况，因此向 metrics 接口获取数据的时候，可以获取到当前秒 GPU 的使用情况。

具体也可参考：[https://blog.csdn.net/wentinghappyday/article/details/127988283](https://blog.csdn.net/wentinghappyday/article/details/127988283)

- statistics，请求相关的统计数据。[文档](https://github.com/triton-inference-server/server/blob/main/docs/protocol/extension_statistics.md)

Statistics 统计信息可以使用客户端工具获得，它记录了从 Triton 启动以来发生的所有活动。

性能测量的方式：

- perf_analyzer，可以测量吞吐延迟等。[文档](https://github.com/triton-inference-server/server/blob/main/docs/perf_analyzer.md)、[最佳实践](https://github.com/triton-inference-server/client/blob/main/src/c++/perf_analyzer/README.md)

- model_analyzer，利用 perf_analyzer 来进行性能分析，测量 GPU 内存和利用率。[仓库](https://github.com/triton-inference-server/model_analyzer)

model_analyzer 通过暴力搜索选项来找到最好的配置，这些选项有些是 triton 自动配置的，一些是需要你手动配置才会搜索的。

更多的模型配置选项可以参考这个 [模型配置搜索文档](https://github.com/triton-inference-server/model_analyzer/blob/main/docs/config_search.md)。

- model_navigator，自动化部署模型。[仓库](https://github.com/triton-inference-server/model_navigator)

### 2.5 DALI加速预处理

DALI可以把复杂的数据预处理搬到GPU上进行，或者把预处理打包至模型处理的pipeline，从而减少推理空泡时间。

以下搬运自：[https://www.cnblogs.com/zzk0/p/15517120.html](https://www.cnblogs.com/zzk0/p/15517120.html)

首先保存dali的pipeline

```Python
import nvidia.dali as dali
import nvidia.dali.fn as fn

@dali.pipeline_def(batch_size=128, num_threads=4, device_id=0)
def pipeline():
images = fn.external_source(device='cpu', name='DALI_INPUT_0')
images = fn.resize(images, resize_x=224, resize_y=224)
images = fn.transpose(images, perm=[2, 0, 1])
images = images / 255
return images

pipeline().serialize(filename='./1/model.dali')
```

组织dali模型

```Plain Text
.
├── 1
│   └── model.dali
├── config.pbtxt
```

构建dali pipeline

```Plain Text
name: "resnet50_dali"
backend: "dali"
max_batch_size: 128
input [
  {
    name: "DALI_INPUT_0"
    data_type: TYPE_FP32
    dims: [ -1, -1, 3 ]
  }
]

output [
  {
    name: "DALI_OUTPUT_0"
    data_type: TYPE_FP32
    dims: [ 3, 224, 224 ]
  }
]
instance_group [
  {
    count: 1
    kind: KIND_GPU
    gpus: [ 0 ]
  }
]

```

```Plain Text
name: "resnet50_ensemble"
platform: "ensemble"
max_batch_size: 128
input [
  {
    name: "ENSEMBLE_INPUT_0"
    data_type: TYPE_FP32
    dims: [ -1, -1, 3 ]
  }
]
output [
  {
    name: "ENSEMBLE_OUTPUT_0"
    data_type: TYPE_FP32
    dims: [ 1000 ]
  }
]
ensemble_scheduling {
  step [
    {
      model_name: "resnet50_dali"
      model_version: 1
      input_map: {
        key: "DALI_INPUT_0"
        value: "ENSEMBLE_INPUT_0"
      }
      output_map: {
        key: "DALI_OUTPUT_0"
        value: "preprocessed_image"
      }
    },
    {
      model_name: "resnet50_pytorch"
      model_version: 1
      input_map: {
        key: "INPUT__0"
        value: "preprocessed_image"
      }
      output_map: {
        key: "OUTPUT__0"
        value: "ENSEMBLE_OUTPUT_0"
      }
    }
  ]
}

```

除了预处理加速，我们还可以对数据读取进行加速，可参考：数据加载预处理DALI加速-保姆级教程 - 路过的AI小白s的文章 - 知乎 <https://zhuanlan.zhihu.com/p/506478404>

对于dali，你也可以参考nvidia的文章：[https://developer.nvidia.com/blog/accelerating-inference-with-triton-inference-server-and-dali/](https://developer.nvidia.com/blog/accelerating-inference-with-triton-inference-server-and-dali/)

### 2.6 模型加载卸载时callback（agent）

请参考：[https://www.cnblogs.com/zzk0/p/15553394.html](https://www.cnblogs.com/zzk0/p/15553394.html)

包含了agent的使用和实现

```Plain Text
model_repository_agents
{
  agents [
    {
      name: "checksum",
      parameters
      {
        key: "MD5:1/model.py",
        value: "4e2c177998feb5539d8ec8d820f990bd"
      }
    }
  ]
}
```

### 2.7 限制模型资源使用

感谢：[Rate Limiter 的使用](https://www.cnblogs.com/zzk0/p/15542015.html)

我们需要设置配置并开启选项 --rate-limit ，可参考[文档](https://github.com/triton-inference-server/server/blob/64975185d58ddf8a9d1fe83b5d2104286c8ab45f/docs/user_guide/model_configuration.md?plain=1#L309)

```Plain Text
instance_group [
    {
      count: 2
      kind: KIND_CPU
      rate_limiter {
        resources [
          {
            name: "R1"
            count: 10
          },
          {
            name: "R2"
            count: 5
          },
          {
            name: "R3"
            global: True
            count: 10
          }
        ] 
        priority: 1
      }
    }
  ]
```

## 其他

- 除了triton外，还推荐使用的推理引擎基座：

[Seldon Core](http://link.zhihu.com/?target=https%3A//github.com/SeldonIO/seldon-core)，是由一个英国公司[Seldon Technologies Limited](http://link.zhihu.com/?target=https%3A//en.wikipedia.org/wiki/Seldon_%28company%29)研发并开源的，这是一套基于kubernetes，聚焦于AI模型服务化这个垂直领域的整体解决方案，包括服务从创建到销毁的全部生命周期的管理，以及配套的网络路由方案和生命周期等。在知乎上还有一篇介绍Seldon Core的文章《[开源史海钩沉系列 [2] Seldon Core](https://zhuanlan.zhihu.com/p/145143582)》

相比triton,seldon-core-microservice把模型load和infer/predict的工作，完全交给用户完成:

```Plain Text
import pickle
class Model:
    def __init__(self):
        self._model = pickle.loads( open("model.pickle", "rb") )

    def predict(self, X):
        output = self._model(X)
        return output
```

除此外，基于V2 Inference Protocol的MLServer 也可以稍作尝试。

- 如何实现triton backend
 [如何实现一个 backend](https://www.cnblogs.com/zzk0/p/15496171.html)
模型推理服务化：如何基于Triton开发自己的推理引擎？ - 我是小北挖哈哈的文章 - 知乎 <https://zhuanlan.zhihu.com/p/354058294>

- 共享内存

[https://github.com/triton-inference-server/server/blob/main/docs/protocol/extension_shared_memory.md
](<https://github.com/triton-inference-server/server/blob/main/docs/protocol/extension_shared_memory.md>

Shared Memory 允许客户端使用共享内存的数据，无需通过 HTTP 或者 gRPC 来进行数据通信。共享内存需要注册、注销操作，另外还可以获取状态。)Shared Memory 允许客户端使用共享内存的数据，无需通过 HTTP 或者 gRPC 来进行数据通信。共享内存需要注册、注销操作，另外还可以获取状态。

## Reference

nvidia官方视频教程

[https://www.bilibili.com/video/BV1KS4y1v7zd/](https://www.bilibili.com/video/BV1KS4y1v7zd/)

nvidia官方文档

[https://developer.nvidia.com/triton-inference-server](https://developer.nvidia.com/triton-inference-server)

[https://github.com/triton-inference-server/server/blob/r21.05/docs/architecture.md](https://github.com/triton-inference-server/server/blob/r21.05/docs/architecture.md)

官方仓库

[https://github.com/NVIDIA/TensorRT/blob/main/quickstart/deploy_to_triton/triton_client.py](https://github.com/NVIDIA/TensorRT/blob/main/quickstart/deploy_to_triton/triton_client.py)

官方NGC

[https://catalog.ngc.nvidia.com/orgs/nvidia/containers/tritonserver](https://catalog.ngc.nvidia.com/orgs/nvidia/containers/tritonserver)

查看NGC对应驱动

[https://docs.nvidia.com/deeplearning/triton-inference-server/release-notes/index.html](https://docs.nvidia.com/deeplearning/triton-inference-server/release-notes/index.html)

Nvidia Triton使用教程：从青铜到王者 - infgrad的文章 - 知乎 <https://zhuanlan.zhihu.com/p/516017726>

模型推理服务化：Seldon Core之Microservices - 我是小北挖哈哈的文章 - 知乎 <https://zhuanlan.zhihu.com/p/625967775>

我不会用 Triton 系列：上手指北

[https://www.cnblogs.com/zzk0/p/15543824.html](https://www.cnblogs.com/zzk0/p/15543824.html)

衡量和优化使用 Triton 推理服务器和 Tesla T4 的 TensorFlow 推理系统的性能
[https://cloud.google.com/architecture/measuring-and-tuning-the-performance-of-a-tensorflow-inference-system?hl=zh-cn#objectives](https://cloud.google.com/architecture/measuring-and-tuning-the-performance-of-a-tensorflow-inference-system?hl=zh-cn#objectives)
