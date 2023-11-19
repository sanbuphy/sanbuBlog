---
title: GETTING STARTED WITH DISTRIBUTED CHECKPOINT (DCP)
keywords: ['pytorch']
---

截止至 pytorch 2.1 新特性翻译，原文
<https://pytorch.org/tutorials/recipes/distributed_checkpoint_recipe.html>

前置内容:

[FullyShardedDataParallel API文档](https://pytorch.org/docs/master/fsdp.html)
[torch.load API文档](https://pytorch.org/docs/stable/generated/torch.load.html)

在分布式训练期间对AI模型进行检查点保存可能具有挑战性,因为参数和梯度在训练器之间进行了分区,而在恢复训练时可用的训练器数量可能会改变。Pytorch 分布式检查点(DCP)可以帮助简化此过程。

在本教程中,我们展示了如何将DCP API与简单的FSDP包装模型一起使用。

DCP的工作原理
torch.distributed.checkpoint()可以并行保存和加载来自多个rank的模型。此外,检查点自动处理全限定名(FQN)在模型和优化器之间的映射,从而启用加载时重新分片到不同的集群拓扑。

DCP与torch.save()和torch.load()有几个明显的不同:

每个检查点会产生多个文件,每个rank至少一个。
它是原地操作的,这意味着模型应该首先分配它的数据,DCP将使用那个存储空间。
