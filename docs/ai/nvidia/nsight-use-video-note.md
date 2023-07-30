---
title: Nsight Systems/Compute 使用分享笔记
keywords: ['nvidia']
---

本文原视频出自百度培训中心：
[https://www.bilibili.com/video/BV15P4y1R7VG/?vd_source=a6509cab8ccb8b81d6a70af693cc008f](https://www.bilibili.com/video/BV15P4y1R7VG/?vd_source=a6509cab8ccb8b81d6a70af693cc008f)

利用工具：autocut-dev 转录，以及claude2 缩写

prompt：

1. 请你根据全文，分章节阐述讲了什么

2. 详细讲解一下章节X

## 全文概括

第一章 介绍了NVIDIA的GPU性能分析工具Nsight的产品组成,它包含了Nsight System、Nsight Compute和Nsight Graphics三个组件,各自用于不同的性能分析场景。

第二章 介绍了Nsight System的功能和特点,它可以进行系统级性能分析,通过pipeline时间线分析CPU和GPU的协同情况,同时支持多进程和多节点应用的分析。

第三章 介绍了Nsight Compute的功能和特点,它可以进行CUDA kernel级别的细粒度性能分析,查看硬件指令执行情况等信息,用于优化kernel性能。

第四章 通过几个案例介绍了Nsight System和Nsight Compute的具体使用,包括分析深度学习训练流程、优化BERT性能、优化矩阵转置kernel等,讲解了如何使用Nsight进行性能分析与优化。

第五章 总结了Nsight的优势,它是一个功能强大的GPU性能分析平台,可以帮助开发者定位各种性能瓶颈并进行优化,提升CUDA应用的性能。

:::info
对于具体使用部分的阐述
:::

Nsight System可以捕获CUDA运行时API调用,如内存复制、kernel启动等,通过pipeline时间线分析CPU和GPU时间占比、空闲状态等。支持添加NVTX注释进行代码注释。输出标准性能分析文件供查看分析。

Nsight Compute可以分析CUDA kernel的细粒度性能数据,如每个thread的stall原因、instruction throughput、memory throughput等。可以比较不同kernel的性能数据。支持汇编代码分析。

案例一利用Nsight System分析深度学习训练流程,发现数据加载阶段GPU空闲时间过长。通过增加DataLoader线程数,缩短GPU空闲时间,提升性能。

案例二利用Nsight System分析BERT训练,发现矩阵乘法kernel占比过高。采用混合精度及TensorCore优化,加速矩阵乘法计算,提升训练吞吐。

案例三利用Nsight Compute分析矩阵转置kernel,发现Global Memory读写效率过低。通过使用Shared Memory优化,解决不连续访问问题,显著提升性能。

:::info
以下是分章节阐述
:::

### 案例一：分析训练流程，增加dataloader并行

案例一利用Nsight System分析一个PyTorch的图像分类模型的训练流程,主要包含以下步骤:

1. 构建包含卷积层和全连接层的ResNet模型,以及损失函数和优化器。

2. 准备MNIST数据集,并用DataLoader加载,batch size设为128。

3. 在训练循环中,调用model进行前向传播计算loss,然后optimizer进行反向传播更新参数。

4. 使用Nsight System生成默认配置的时间线分析图,发现GPU在DataLoader阶段出现大量空闲。

5. 添加NVTX注释,标记出计算图的主要阶段。重新生成时间线,验证DataLoader阶段GPU空闲。

6. DataLoader使用了单线程,导致GPU等待数据加载。将DataLoader线程数提升到8个,图片加载时间降低8倍。

7. 重启分析,GPU空闲时间显著减少。每轮训练时间由460ms降至290ms。

### 案例二：分析BERT训练，加速乘法计算

案例二利用Nsight System分析基于BERT的transformer模型的训练流程,主要包含以下步骤:

1. 构建transformer模型,包含多层encoder和decoder结构。

2. 加载Wikitext数据集,进行词嵌入和位置编码,输入到transformer模型进行训练。

3. 检查Nsight系统timeline,发现transformer的Attention模块占比超过60%。

4. Attention模块大量使用矩阵乘法操作,是计算热点。

5. 初始实现使用FP32精度计算矩阵乘法。Nsight Compile确认计算使用CUDA Cores。

6. 利用TensorCore可以加速矩阵乘法计算。使用混合精度训练,Converter模型到FP16。

7. 更新Nsight时间线,矩阵乘法kernel执行时间减少2倍。总训练吞吐提升1.8倍。

8. 后续可以考虑进一步使用TF32或Int8压缩模型大小,进一步提升性能。

### 案例三：分析矩阵转置kernel，使用shared memory优化

案例三利用Nsight Compute分析一个矩阵转置的CUDA kernel程序,主要包含以下步骤:

1. 实现一个简单的矩阵转置kernel,针对一个8192x4096的矩阵,按行读入,按列输出。

2. Nsight Compute分析发现,读取throughput符合预期,但写入throughput仅为理论值的12.5%。

3. 查看显存访问模式,读取是连续的,但写入出现大量不连续跳跃访问。

4. 这是因为读取是按行,写入是按列,导致写入地址无序。L2 cache miss rate极高。

5. 将kernel修改为:先加载到Shared Memory中,在Shared Memory中转置,再写入Global Memory。

6. Shared Memory具有很高的读取和写入带宽,可以有效改善不连续访问。

7. 优化后,Gs 写入throughput提升到理论峰值,kernel执行时间缩短8倍。

8. 进行 Shared Memory tiling 可以进一步优化大矩阵的转置性能。

## 个人感悟和记录

待定
