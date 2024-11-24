---
title: TensorRT+ int8官方论坛中有趣的讨论总结(转) 2023-05-20
---

本文转载自：<https://blog.csdn.net/yangjf91/article/details/92794182>

1、自定义层的int8优化

  [TensorRT INT8 plugin layer](https://devtalk.nvidia.com/default/topic/1047184/tensorrt/tensorrt-int8-plugin-layer/post/5350305/#5350305)

  [About use int8 model!](https://devtalk.nvidia.com/default/topic/1043895/tensorrt/about-use-int8-model-/post/5298264/#5298264)
  官方开发人员只说了支持4种格式，未来会加入更多特性，没说能否自己实现自定义层的int8优化。

2、int8优化后检测准确度降低

  [Int8 Calibration is not accurate … see image diff with and without](https://devtalk.nvidia.com/default/topic/1050874/tensorrt/int8-calibration-is-not-accurate-see-image-diff-with-and-without/post/5350109/#5350109)

  [convert a detect model to int8, the performance drops a lot](https://devtalk.nvidia.com/default/topic/1049027/tensorrt/convert-a-detect-model-to-int8-the-performance-drops-a-lot/post/5324031/#5324031)

  有人发现检测网络在经过int8优化有存在差异，甚至准确度下降，但官方开发人员通过yolo测试认为没有这个问题，并提出用 legacy calibrator 代替entropy calibrator来校准模型，有利于提高准确度。不过按照官方文档的说法，legacy calibrator应该是要被废弃的方法。

3、int8优化后准确度提高

  [Analyzing sampleInt8 accuracy](https://devtalk.nvidia.com/default/topic/1052768/tensorrt/analyzing-sampleint8-accuracy-/post/5348385/#5348385)

  有人实验发现通过int8优化后，模型的识别准确度提高了，有人分析可能是模型本身训练过程中过拟合，通过int8优化后降低了模型的过拟合程度，因此在测试集上表现出识别准确度提升。

4、int8校准表在不同设备上的使用问题

  [Could TensorRT INT8 CalibrationTable be use on different Hardware platform？](https://devtalk.nvidia.com/default/topic/1050952/tensorrt/could-tensorrt-int8-calibrationtable-be-use-on-different-hardware-platform-/post/5335781/#5335781)

  官方开发人员答曰，校准表如果使用相同的TensorRT版本时优化方法都是相同的，特别提到了如果使用5.1后的EntropyCalibrator2（官方文档中声明该方法需要DLA）则可以不同平台移植。
  [Do tensorRT plan files are portable across different GPUs which have the same type](https://devtalk.nvidia.com/default/topic/1049822/tensorrt/do-tensorrt-plan-files-are-portable-across-different-gpus-which-have-the-same-type/post/5327943/#5327943)

  需要注意的是TensorRT的文件在不同平台上还是慎用，可能出现警告！

5、int8优化fastrcnn

  [“Engine buffer is full”](https://devtalk.nvidia.com/default/topic/1038750/tensorrt/-quot-engine-buffer-is-full-quot-/post/5333126/#5333126)
  
官方安装包的sample有fastrcnn，但需要添加plugin，这个讨论是2018年8月的，提到fastrcnn的int8转换似乎有点困难，先Mark一下。

6、检查TensorRT优化后各层的精度

  [How to check layer precision?](https://devtalk.nvidia.com/default/topic/1048038/tensorrt/how-to-check-layer-precision-/post/5320889/#5320889)
  
使用nvprof。

7、某层输出为0，会导致int8校准失败

  [Int8 Calibration failing when one layer’s output is uniformly zero](https://devtalk.nvidia.com/default/topic/1047780/tensorrt/int8-calibration-failing-when-one-layers-output-is-uniformly-zero/post/5319817/#5319817)

  如果模型某层权重全为0，会导致该层输出全为0，因此会提示int8校准失败。官方开发人员认为这不是推理模型中的常见问题，建议修改裁剪掉模型中的这个分支。

8、TensorRT模型的显存使用

  [TensorFlow/TRT with multiple TF sessions - Dynamic INT8 engine memory allocation errors](https://devtalk.nvidia.com/default/topic/1046059/tensorrt/tensorflow-trt-with-multiple-tf-sessions-dynamic-int8-engine-memory-allocation-errors/post/5313991/#5313991)

  官方开发人员说TensorRT的背景就是要求使用所有的显存来构建最优的推理模型，如TensorFlow的显存指定不会在TensorRT生效。而setMaxWorkSpace(X)的API只是指定产生引擎的存储大小。

9、DLA

 [How to use DLA with Tesla T4](https://devtalk.nvidia.com/default/topic/1045452/tensorrt/how-to-use-dla-with-tesla-t4/post/5311981/#5311981)

  DLA是TensorRT的一项设置项，但目前官方文档中只有Jetson AGX Xavier标明支持DLA。这里有人回答说DLA只用在移动平台相关产品，桌面GPU产品没有这个单元。

10、大BatchSize可以提升TensorRT推断速度

  [Why inference speedup increases with the increase of batch size in tensorrt int8？](https://devtalk.nvidia.com/default/topic/1045386/tensorrt/why-inference-speedup-increases-with-the-increase-of-batch-size-in-tensorrt-int8-/post/5304304/#5304304)

  官方开发人员说大BatchSIze可以更高效的使用GPU，特别是使用32的倍数作为批大小可以在如V100、T4这类显卡上充分利用专有内核加速矩阵乘法和全连接层。

11、TensorRT加速没效果

  [Dont see any speedups using TensorRT](https://devtalk.nvidia.com/default/topic/1043578/tensorrt/dont-see-any-speedups-using-tensorrt/post/5294251/#5294251)

  TensorRT的加速性能取决于将多少原网络的操作替换为TensorRT的优化操作，对于python+TensorFlow可以通过以下代码查看。

```
trt_engine_ops = len([1 for n in trt_graph.node if str(n.op)=='TRTEngineOp'])
```
