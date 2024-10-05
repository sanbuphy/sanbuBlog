---
title: ONNXRuntime文档拾遗
---


## Reference

onnxruntime的官方范例汇总

[https://github.com/microsoft/onnxruntime-inference-examples](https://github.com/microsoft/onnxruntime-inference-examples "https://github.com/microsoft/onnxruntime-inference-examples")

onnxruntime官方文档

[https://onnxruntime.ai/docs/](https://onnxruntime.ai/docs/ "https://onnxruntime.ai/docs/")

onnxruntime版本release以及更新相关

[https://github.com/microsoft/onnxruntime/releases](https://github.com/microsoft/onnxruntime/releases "https://github.com/microsoft/onnxruntime/releases")

onnxruntime的官方文档其实有些东西容易被人忽略，我们来看看在文档边角处有什么东西：

以下onnxruntime为了方便可能简写为onnx：

## ONNX Execution Providers

onnx使用不同的Execution Providers（简称EP），可以理解为不同的后端，以cuda/tensorrt为例

（基于 NVIDIA 的 PC 的端到端 AI ： ONNX Runtime 中的 CUDA 和 TensorRT 执行提供程序)

[https://developer.nvidia.com/zh-cn/blog/end-to-end-ai-for-nvidia-based-pcs-cuda-and-tensorrt-execution-providers-in-onnx-runtime/](https://developer.nvidia.com/zh-cn/blog/end-to-end-ai-for-nvidia-based-pcs-cuda-and-tensorrt-execution-providers-in-onnx-runtime/ "https://developer.nvidia.com/zh-cn/blog/end-to-end-ai-for-nvidia-based-pcs-cuda-and-tensorrt-execution-providers-in-onnx-runtime/")

ONNX Runtime Execution Providers（一共支持的）

[https://onnxruntime.ai/docs/execution-providers/](https://onnxruntime.ai/docs/execution-providers/ "https://onnxruntime.ai/docs/execution-providers/")

ONNX Runtime works with different hardware acceleration libraries through its extensible **Execution Providers** (EP) framework to optimally execute the ONNX models on the hardware platform.&#x20;

This interface enables flexibility for the AP application developer to deploy their ONNX models in different environments in the cloud and the edge and optimize the execution by taking advantage of the compute capabilities of the platform.

### Which Execution Provider will provide the best performance?

[https://onnxruntime.ai/docs/performance/tune-performance.html](https://onnxruntime.ai/docs/performance/tune-performance.html "https://onnxruntime.ai/docs/performance/tune-performance.html")

**CUDA (Default GPU) or CPU?**

The CPU version of ONNX Runtime provides a complete implementation of all operators in the ONNX spec. This ensures that your ONNX-compliant model can execute successfully. In order to keep the binary size small, common data types are supported for the ops. If you are using an uncommon data type that is not supported, you can file an issue and/or contribute a PR (see examples - [PR #2112](https://github.com/microsoft/onnxruntime/pull/2112 "PR #2112"), [PR #2034](https://github.com/microsoft/onnxruntime/pull/2034 "PR #2034"), [PR #1565](https://github.com/microsoft/onnxruntime/pull/1565 "PR #1565")). Please make sure you provide details on usage justification.

Additionally, not all CUDA kernels are implemented, as these have been prioritized on an as-needed basis. This means that if your model contains operators that do not have a CUDA implementation, it will fall back to CPU. Switching between CPU and GPU can cause significant performance impact. If you require a specific operator that is not currently supported, please consider [contributing](https://github.com/microsoft/onnxruntime/tree/main/CONTRIBUTING.md "contributing") and/or [file an issue](https://github.com/microsoft/onnxruntime/issues "file an issue") clearly describing your use case and share your model if possible.

**TensorRT or CUDA?**

TensorRT and CUDA are separate execution providers for ONNX Runtime. On the same hardware, TensorRT will generally provide better performance; however, this depends on the specific model and whether the operators in the model can be supported by TensorRT. In cases where TensorRT cannot handle the subgraph(s), it will fall back to CUDA. Note that the TensorRT EP may depend on a different version of CUDA than the CUDA EP.

**TensorRT/CUDA or DirectML?**

DirectML is the hardware-accelerated DirectX 12 library for machine learning on Windows and supports all DirectX 12 capable devices (Nvidia, Intel, AMD). This means that if you are targeting Windows GPUs, using the DirectML Execution Provider is likely your best bet. This can be used with both the ONNX Runtime as well as [WinML APIs](https://docs.microsoft.com/en-us/windows/ai/windows-ml/api-reference "WinML APIs").

## 加快模型加载初始化时间

参考[https://onnxruntime.ai/docs/performance/graph-optimizations.html](https://onnxruntime.ai/docs/performance/graph-optimizations.html "https://onnxruntime.ai/docs/performance/graph-optimizations.html")

可以看到：

All optimizations can be performed either online or **offline**. In online mode, when initializing an inference session,\*\* we also apply all enabled graph optimizations before performing model inference\*\*. Applying all optimizations each time we initiate a session can add overhead to the model startup time (especially for complex models), which can be critical in production scenarios. This is where the offline mode can bring a lot of benefit. In offline mode, after performing graph optimizations, ONNX Runtime serializes the resulting model to disk. Subsequently, we can reduce startup time by using the already optimized model and disabling all optimizations.

**注意事项**：

- 在离线模式下运行时，确保使用与运行模型推理的目标机器完全相同的选项（例如，执行提供程序、优化级别）和硬件（例如，您不能运行针对 GPU 预先优化的模型仅配备 CPU 的机器上的执行提供者）。
- 启用布局优化后，保存离线模型时，只能在与环境兼容的硬件上使用离线模式。例如，如果模型具有针对 AVX2 优化的布局，则离线模型将需要支持 AVX2 的 CPU。

Notes:
When running in offline mode, make sure to use the exact same options (e.g., execution providers, optimization level) and hardware as the target machine that the model inference will run on (e.g., you cannot run a model pre-optimized for a GPU execution provider on a machine that is equipped only with CPU).
When layout optimizations are enabled, the offline mode can only be used on compatible hardware to the environment when the offline model is saved. For example, if model has layout optimized for AVX2, the offline model would require CPUs that support AVX2.

实际上，这个工作在optimizer的时候也可以完成，本身是将凸优化之后的模型进行保存。

## ONNX optimizer

对于一般的模型，我们来看文档怎么说

**Graph Optimization Levels**

Graph optimizations are divided into three levels:

1. Basic
2. Extended
3. Layout Optimizations

The optimizations belonging to one level are performed after the optimizations of the previous level have been applied (e.g., extended optimizations are applied after basic optimizations have been applied).

**All optimizations are enabled by default.**

所以，除非需要减少优化等级增加兼容性，才需要显式调整；或者需要保存优化后模型加快加载速度。（具体看官方），在这里这并不是我们需要介绍的重点，我们来看看更重要的优化工具。

对于transformer模型，有更细节的优化工具，这也是huggingface的优化工具的由来。实际上操作也很简单，首先在onnxruntime源码中找到：

`onnxruntime/python/tools/transformers/optimizer.py`，然后直接在目录下运行，会看到好多选项：

```bash
usage: optimizer.py [-h] --input INPUT --output OUTPUT [--model_type {bart,bert,bert_tf,bert_keras,gpt2,gpt2_tf,tnlr,t5,unet,vae,clip}] [--num_heads NUM_HEADS]
                    [--hidden_size HIDDEN_SIZE] [--input_int32] [--float16] [--disable_attention] [--disable_skip_layer_norm] [--disable_embed_layer_norm]
                    [--disable_bias_skip_layer_norm] [--disable_bias_gelu] [--disable_layer_norm] [--disable_gelu] [--enable_gelu_approximation]
                    [--disable_shape_inference] [--enable_gemm_fast_gelu] [--use_mask_index] [--use_raw_attention_mask] [--no_attention_mask]
                    [--use_multi_head_attention] [--disable_group_norm] [--disable_packed_kv] [--disable_packed_qkv] [--disable_bias_add]
                    [--disable_bias_splitgelu] [--verbose] [--use_gpu] [--only_onnxruntime] [--opt_level {0,1,2,99}] [--use_external_data_format]
optimizer.py: error: the following arguments are required: --input, --output
```

根据要求我们需要填充输入和输出，然后opt-level具体说什么可以看官网，99的时候做了数据结构的硬件适配优化；--only\_onnxruntime是应用只适合onnxruntime读取使用的图优化。至于

## ONNX 编译选项

可参考：[https://zhuanlan.zhihu.com/p/411887386](https://zhuanlan.zhihu.com/p/411887386 "https://zhuanlan.zhihu.com/p/411887386")

我的常用参数:`./build.sh --use_dnnl --build_wheel  --parallel --skip_tests --config Release`&#x20;

编译python  whl的时候记得环境里要安装numpy和packaging等：

python3 -m pip install wheel setuptools numpy packaging

\--update：是否更新makefile文件，这里解释一下action='store\_true'，意思是，一旦在命令行指定了--update，则args.update会被设置成True，否则为False；所以，所有指定了action='store\_true'的参数，默认值都为False
\--parallel：是否利用多核并行构建，用就是了。
\--skip\_tests：是否跳过单元测试，不跳过编译过程会慢很多，建议跳过。
\--build\_shared\_lib：注意，如果你需要编译一个动态库，则需要指定此参数，否则编译的是静态库。

其他：

enable\_nvtx\_profile：在ORT使用NVTX profile。NVTX（NVIDIA® Tools Extension SDK）是一个提供事件注解，编码ranges和资源的c接口程序库

use\_horovod：使用horovod。Horovod是Uber开源的基于Ring-AllReduce方法的深度学习分布式训练工具，以支持多种流行架构包括TensorFlow、Keras、PyTorch等

msvc\_toolset：使用msvc工具集。msvc是微软的编译器vc

use\_xcode：使用xcode。xcode是Mac OS上的集成开发工具（IDE）

use\_jemalloc：使用jemalloc。JeMalloc 是一款内存分配器，与其它内存分配器相比，它最大的优势在于多线程情况下的高性能以及内存碎片的减少。

use\_mimalloc：使用mimalloc。mimalloc是具有出色性能特征的通用内存分配器，用于Koka和Lean语言的运行时系统

use\_openblas：使用openblas。BLAS（Basic Linear Algebra Subprograms 基础线性代数程序集）是一个应用程序接口（API）标准，用以规范发布基础线性代数操作的数值库（矩阵运算库），BLAS：标准实现（Fortran），CBLAS：C的BLAS标准实现，Atlas：一种优化实现，GotoBLAS：多线程性能良好的优化实现（已停止更新），OpenBLAS：目前性能最好的开源实现，基于GotoBLAS，MKL：Intel实现，在Intel处理器上性能最佳

use\_dnnl：使用dnnl。Dnnl是Intel开发的高性能深度学习优化库，此前叫做MKL-DNN。

use\_mklml：使用mklml。Mklml是MKL中面向机器学习的部分

use\_featurizers：使用ML Featurizer。ML Featurizer是adobe开发的用于特征工程中从数据中快速提取补充特征的库

use\_ngraph：使用ngraph。nGraph是intel开源的，面向各种设备和框架的深度神经网络模型编译器，减少将模型部署到各种设备训练和运行的工作量

use\_openvino：使用openvino。OpenVINO是英特尔基于自身现有的硬件平台开发的一种可以加快高性能计算机视觉和深度学习视觉应用开发速度工具套件，支持各种英特尔平台的硬件加速器上进行深度学习，并且允许直接异构执行，拥有算法模型上线部署的各种能力

use\_nnapi：使用nnapi。Android Neural Networks API (NNAPI) 是一个基于 Android 系统的用于可在移动设备上运行与机器学习相关的计算密集型操作的 C 语言 API，NNAPI 将为更高层次的可构建和训练神经网络的机器学习框架（如 TensorFLow Lite, Caffe2, 等等）提供底层支持。

use\_openmp：使用openmp。

## 高级性能调优

有关显式指定线程：

```python
sess_opt = SessionOptions()
sess_opt.intra_op_num_threads = 3
sess = ort.InferenceSession('model.onnx', sess_opt)
```

With above configuration, two threads will be created in the pool, so along with the main calling thread, there will be three threads in total to participate in intra-op computation. By default, each session will create one thread per phyical core (except the 1st core) and attach the thread to that core. However, if customer explicitly set the number of threads like showcased above, there will be no affinity set to any of the created thread.

## ONNX量化

量化是在推理过程中将模型参数和激活从 32 位浮点数转换为 8 位整数的过程。这样做可以显著减少模型的内存占用和计算需求，从而提高推理速度。

### 量化格式

- **QOperator（操作符导向）**：每个量化的操作符都有自己的 ONNX 定义，例如 QLinearConv 和 MatMulInteger。
- **QDQ（张量导向，Quantize and DeQuantize）**：在原始操作符之间插入 DeQuantizeLinear 和 QuantizeLinear 来模拟量化和反量化过程。

### 量化方法

- **动态量化**：在推理过程中动态计算激活的量化参数（尺度和零点），适用于 RNN 和 Transformer 模型。
- **静态量化**：预先使用校准数据集计算量化参数，并应用于所有输入，适用于 CNN 模型。

### 量化调试

量化可能会影响模型的精度。为了减小这种影响，提供了匹配权重和激活张量的 API，以便于比较原始模型和量化模型之间的差异。

### GPU 上的量化

为了在 GPU 上实现更好的性能，需要支持 Tensor Core int8 计算的硬件（如 T4 或 A100）。在 GPU 上，ONNX Runtime 使用 TensorRT 执行提供程序进行量化。

- Implement a [CalibrationDataReader](https://github.com/microsoft/onnxruntime/blob/07788e082ef2c78c3f4e72f49e7e7c3db6f09cb0/onnxruntime/python/tools/quantization/calibrate.py "CalibrationDataReader").
- Compute quantization parameters using a calibration data set. Note: In order to include all tensors from the model for better calibration, please run `symbolic_shape_infer.py` first. Please refer to [here](https://onnxruntime.ai/docs/execution-providers/TensorRT-ExecutionProvider.html#samples "here") for details.
- Save quantization parameters into a flatbuffer file
- Load model and quantization parameter file and run with the TensorRT EP.

We provide two end-to end examples: [Yolo V3](https://github.com/microsoft/onnxruntime-inference-examples/tree/main/quantization/object_detection/trt/yolov3 "Yolo V3") and [resnet50](https://github.com/microsoft/onnxruntime-inference-examples/tree/main/quantization/image_classification/trt/resnet50 "resnet50").

### 特殊量化

- **4 位量化**：ONNX Runtime 支持将某些操作符量化为 4 位整数类型，主要应用于 MatMul 和 Gather 操作符。
- **性能提升**：性能提升依赖于模型和硬件的特性。旧硬件可能无法从量化中受益。
- **方法选择**：对于 RNN 和 Transformer 模型，推荐使用动态量化；对于 CNN 模型，推荐使用静态量化。

## Mixed Precision

If float16 conversion is giving poor results, you can convert most of the ops to float16 but leave some in float32. The `auto_mixed_precision.auto_convert_mixed_precision` tool finds a minimal set of ops to skip while retaining a certain level of accuracy. You will need to provide a sample input for the model.

Since the CPU version of ONNX Runtime doesn’t support float16 ops and the tool needs to measure the accuracy loss, **the mixed precision tool must be run on a device with a GPU**.

```python
from onnxconverter_common import auto_mixed_precision
import onnx

model = onnx.load("path/to/model.onnx")
# Assuming x is the input to the model
feed_dict = {'input': x.numpy()}
model_fp16 = auto_convert_mixed_precision(model, feed_dict, rtol=0.01, atol=0.001, keep_io_types=True)
onnx.save(model_fp16, "path/to/model_fp16.onnx")
```

### Mixed Precision Tool Arguments

```python
auto_convert_mixed_precision(model, feed_dict, validate_fn=None, rtol=None, atol=None, keep_io_types=False)
```

- `model`: The ONNX model to convert.
- `feed_dict`: Test data used to measure the accuracy of the model during conversion. Format is similar to InferenceSession.run (map of input names to values)
- `validate_fn`: A function accepting two lists of numpy arrays (the outputs of the float32 model and the mixed-precision model, respectively) that returns `True` if the results are sufficiently close and `False` otherwise. Can be used instead of or in addition to `rtol` and `atol`.
- `rtol`, `atol`: Absolute and relative tolerances used for validation. See [numpy.allclose](https://numpy.org/doc/stable/reference/generated/numpy.allclose.html "numpy.allclose") for more information.
- `keep_io_types`: Whether model inputs/outputs should be left as float32.

The mixed precision tool works by converting clusters of ops to float16. If a cluster fails, it is split in half and both clusters are tried independently. A visualization of the cluster sizes is printed as the tool works.

***
