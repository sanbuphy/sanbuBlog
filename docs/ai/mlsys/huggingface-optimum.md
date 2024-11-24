---
title: Huggingface optimum介绍 2023-02-24
---

具体请参考文档：

[https://huggingface.co/docs/optimum/index](https://huggingface.co/docs/optimum/index)

实际上，huggingface 的optimum就是对onnxruntime  optimizer的包装， 如果你是huggingface上面获取的模型，有model和config，那就可以直接通过optimum进行进一步图优化和简单的fp16量化。如果你是自己的自然语言模型，那就只能用onnxruntime的optimizer进行处理了。但实际上应该是一个东西，本质只是一层包装。

它的默认选项如下：

- Gelu fusion with `disable_gelu_fusion=False`,
- Layer Normalization fusion with `disable_layer_norm_fusion=False`,
- Attention fusion with `disable_attention_fusion=False`,
- SkipLayerNormalization fusion with `disable_skip_layer_norm_fusion=False`,
- Add Bias and SkipLayerNormalization fusion with `disable_bias_skip_layer_norm_fusion=False`,
- Add Bias and Gelu / FastGelu fusion with `disable_bias_gelu_fusion=False`,
- Gelu approximation with `enable_gelu_approximation=True`.

具体可以在`optimum/onnxruntime/configuration.py`文件中看到对应的实现：

OptimizationConfig的Attributes注释写的很明白了，每个功能的作用和为什么要设置True和Flase

```Python
    """
    OptimizationConfig is the configuration class handling all the ONNX Runtime optimization parameters.
    There are two stacks of optimizations:
        1. The ONNX Runtime general-purpose optimization tool: it can work on any ONNX model.
        2. The ONNX Runtime transformers optimization tool: it can only work on a subset of transformers models.

    Attributes:
        optimization_level (`int`, defaults to 1):
            Optimization level performed by ONNX Runtime of the loaded graph.
            Supported optimization level are 0, 1, 2 and 99.
                - 0: will disable all optimizations
                - 1: will enable basic optimizations
                - 2: will enable basic and extended optimizations, including complex node fusions applied to the nodes
                assigned to the CPU or CUDA execution provider, making the resulting optimized graph hardware dependent
                - 99: will enable all available optimizations including layout optimizations
        optimize_for_gpu (`bool`, defaults to `False`):
            Whether to optimize the model for GPU inference.
            The optimized graph might contain operators for GPU or CPU only when `optimization_level` > 1.
        fp16 (`bool`, defaults to `False`):
            Whether all weights and nodes should be converted from float32 to float16.
        enable_transformers_specific_optimizations (`bool`, defaults to `True`):
            Whether to only use `transformers` specific optimizations on top of ONNX Runtime general optimizations.
        disable_gelu_fusion (`bool`, defaults to `False`):
            Whether to disable the Gelu fusion.
        disable_layer_norm_fusion (`bool`, defaults to `False`):
            Whether to disable Layer Normalization fusion.
        disable_attention_fusion (`bool`, defaults to `False`):
            Whether to disable Attention fusion.
        disable_skip_layer_norm_fusion (`bool`, defaults to `False`):
            Whether to disable SkipLayerNormalization fusion.
        disable_bias_skip_layer_norm_fusion (`bool`, defaults to `False`):
            Whether to disable Add Bias and SkipLayerNormalization fusion.
        disable_bias_gelu_fusion (`bool`, defaults to `False`):
            Whether to disable Add Bias and Gelu / FastGelu fusion.
        disable_embed_layer_norm_fusion (`bool`, defaults to `True`):
            Whether to disable EmbedLayerNormalization fusion.
            The default value is set to `True` since this fusion is incompatible with ONNX Runtime quantization.
        enable_gelu_approximation (`bool`, defaults to `False`):
            Whether to enable Gelu / BiasGelu to FastGelu conversion.
            The default value is set to `False` since this approximation might slightly impact the model's accuracy.
        use_mask_index (`bool`, defaults to `False`):
            Whether to use mask index instead of raw attention mask in the attention operator.
        no_attention_mask (`bool`, defaults to `False`):
            Whether to not use attention masks. Only works for bert model type.
        disable_embed_layer_norm (`bool`, defaults to `True`):
            Whether to disable EmbedLayerNormalization fusion.
            The default value is set to `True` since this fusion is incompatible with ONNX Runtime quantization
        disable_shape_inference (`bool`, defaults to `False`):
            Whether to disable symbolic shape inference.
            The default value is set to `False` but symbolic shape inference might cause issues sometimes.
        use_multi_head_attention (`bool`, defaults to `False`):
            Experimental argument. Use MultiHeadAttention instead of Attention operator, which has merged weights for Q/K/V projection,
            which might be faster in some cases since 3 MatMul is merged into one."
            "Note that MultiHeadAttention might be slower than Attention since MatMul of input projection is excluded. "
            "MultiHeadAttention has only CUDA implementation so the model can only run with CUDAExecutionProvider.
        enable_gemm_fast_gelu (`bool`, defaults to `True`):
            Enable GemmfastGelu fusion.
        use_raw_attention_mask (`bool`, defaults to `False`):
            Use raw attention mask. Use this option if your input is not right-side padding. This might deactivate fused attention and get worse performance.
        disable_group_norm (`bool`, defaults to `False`):
            Do not fuse GroupNorm. Only works for model_type=unet.
        disable_packed_kv (`bool`, defaults to `False`):
            Do not use packed kv in cross attention. Only works for model_type=unet.
    """
```

这里可能有些人会感觉奇怪，什么叫做`99: will enable all available optimizations including layout optimizations`，这个你可以尝试使用优化后就会看到对应的布局转换（根据不同硬件可能适配的数据构造不同）

`AutoOptimizationConfig`是optimum内部的优化逻辑，最后还是以onnxruntime的为准。

```Python
class AutoOptimizationConfig:
    """
    Factory to create common `OptimizationConfig`.
    """

    _LEVELS = {
        "O1": {
            "optimization_level": 1,
            "enable_transformers_specific_optimizations": False,
        },
        "O2": {
            "optimization_level": 2,
            "enable_transformers_specific_optimizations": True,
        },
        "O3": {
            "optimization_level": 2,
            "enable_transformers_specific_optimizations": True,
            "enable_gelu_approximation": True,
        },
        "O4": {
            "optimization_level": 2,
            "enable_transformers_specific_optimizations": True,
            "enable_gelu_approximation": True,
            "fp16": True,
        },
    }
```

如果你想对模型进行量化，在无法使用optimum的加载情况下，完全可以参考optimum对onnxruntime的包装自行处理，在`AutoQuantizationConfig`的方法中有很多针对对应指令集的量化配置，比如vnni：

```Python
    def avx512_vnni(
        is_static: bool,
        format: Optional[QuantFormat] = None,
        mode: Optional[QuantizationMode] = None,
        use_symmetric_activations: bool = False,
        use_symmetric_weights: bool = True,
        per_channel: bool = True,
        nodes_to_quantize: Optional[List[NodeName]] = None,
        nodes_to_exclude: Optional[List[NodeName]] = None,
        operators_to_quantize: List[NodeName] = ORT_FULLY_CONNECTED_OPERATORS,
    ) -> QuantizationConfig:
        """
        When targeting Intel AVX512-VNNI CPU underlying execution engine leverage the CPU instruction VPDPBUSD to
        compute  \\i32 += i8(w) * u8(x)\\ within a single instruction.

        AVX512-VNNI (AVX512 Vector Neural Network Instruction)
        is an x86 extension Instruction set and is a part of the AVX-512 ISA.

        AVX512 VNNI is designed to accelerate convolutional neural network for INT8 inference.

        :param is_static: Boolean flag to indicate whether we target static or dynamic quantization.
        :param format: Targeted ONNX Runtime quantization format.
            When targeting dynamic quantization mode, the default value is `QuantFormat.QOperator` whereas the default
            value for static quantization mode is `QuantFormat.QLinearOps`
        :param mode: Targeted ONNX Runtime quantization mode, default is QLinearOps to match QDQ format.
            When targeting dynamic quantization mode, the default value is `QuantFormat.QOperator` whereas the default
            value for static quantization mode is `QuantFormat.QLinearOps`
        :param use_symmetric_activations:
        :param use_symmetric_weights:
        :param per_channel: Whether we should quantize per-channel (also known as "per-row"). Enabling this can
            increase overall accuracy while making the quantized model heavier.
        :param nodes_to_quantize:
        :param nodes_to_exclude:
        :param operators_to_quantize:
        :return:
        """
        ensure_valid_mode_or_raise(is_static, mode)
        format, mode = default_quantization_parameters(is_static, format, mode)

        return QuantizationConfig(
            is_static=is_static,
            format=format,
            mode=mode,
            activations_dtype=QuantType.QUInt8,
            activations_symmetric=use_symmetric_activations,
            weights_dtype=QuantType.QInt8,
            weights_symmetric=use_symmetric_weights,
            per_channel=per_channel,
            reduce_range=False,
            nodes_to_quantize=nodes_to_quantize or [],
            nodes_to_exclude=nodes_to_exclude or [],
            operators_to_quantize=operators_to_quantize,
        )
```

这里面的`QuantizationConfig`本质是对`onnxruntime.quantization`的包装，参考设计后可以改造出自己的方案，同时对于静态离线量化要注意到`CalibrationConfig`，具体你可以调试一次过程查看每一步的参数就可以大概明白数据是怎么流动的。

如果你想直接使用huggingface  optimum对支持模型的优化，你可以参考以下流程：

优化过程：

```Python
from optimum.onnxruntime.configuration import OptimizationConfig
from optimum.onnxruntime.optimization import ORTOptimizer


model  = ORTModelForSequenceClassification.from_pretrained("uer/roberta-base-finetuned-dianping-chinese", from_transformers=True)

optimization_config = OptimizationConfig(
    optimization_level=2,  #0,1,2,99
    enable_transformers_specific_optimizations=True,
    optimize_for_gpu=False,
)
# 创建优化器
optimizer = ORTOptimizer.from_pretrained(
    model
)


# 保存模型配置文件
save_dir = "my_optimized"
optimizer.optimize(save_dir=save_dir, optimization_config=optimization_config)

```

优化后加载：

```Python
ort_opt_model = ORTModelForSequenceClassification.from_pretrained(save_dir)
opt_onnx_classifier_new = pipeline("text-classification", model=ort_opt_model, tokenizer=tokenizer, device=-1)

result = opt_onnx_classifier_new ("测试测试测试")

```
