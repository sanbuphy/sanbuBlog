---
title: 简单入门分布式 CHECKPOINT (DCP)
keywords: ['pytorch']
---

截止至 pytorch 2.1，有关新特性文档的中文翻译

原文**GETTING STARTED WITH DISTRIBUTED CHECKPOINT (DCP)**
<https://pytorch.org/tutorials/recipes/distributed_checkpoint_recipe.html>

我会加入一些自己查阅帮助理解的资料，并不是完全的照搬翻译。如果想要了解更多有关分布式的东西请参考：
3.13 PyTorch:分布式训练（只简单介绍原理） - 西周集村001的文章 - 知乎
<https://zhuanlan.zhihu.com/p/634846886>

前置内容:

[FullyShardedDataParallel API文档](https://pytorch.org/docs/master/fsdp.html)

[torch.load API文档](https://pytorch.org/docs/stable/generated/torch.load.html)

The code in this tutorial runs on an 8-GPU server, but it can be easily generalized to other environments.

在分布式训练期间对AI模型进行检查点保存可能具有挑战性,因为参数和梯度在 trainers 之间进行了分区,
而在恢复训练时可用的 trainers 数量可能会改变。Pytorch 分布式检查点(DCP)可以帮助简化此过程。

在本教程中,我们展示了如何将DCP API与简单的  FSDP wrapped model 一起使用。（FSDP 也是一种数据并行策略，但它跨 DDP ranks 对模型参数、优化器状态和梯度做了分片优化。）有关FSDP更多的讯息你可以参考：

Pytorch FULLY SHARDED DATA PARALLEL (FSDP) 初识 - jhang的文章 - 知乎
<https://zhuanlan.zhihu.com/p/620333654>

## DCP的工作原理

首先我们要知道几个基础概念：

group：进程组。默认情况下，只有一个组，即一个 world。（DDP 多进程控制多 GPU）

world_size ：表示全局进程个数。

rank：表示进程序号，用于进程间通讯，表示进程优先级。rank=0 的主机为主节点。

torch.distributed.checkpoint()可以并行保存和加载来自多个rank的模型。此外,检查点自动处理  fully-qualified-name (FQN)在模型和优化器之间的映射,从而启用加载时重新分片到不同的集群拓扑。

DCP与torch.save()和torch.load()有几个明显的不同:

- 每个检查点会产生多个文件,每个rank至少一个。
- DCP是原地操作的,这意味着模型应该首先分配它的数据,随后DCP将使用那个存储空间。(torch.load 是需要先加载 state dict 到内存，然后再调用 model 的 load 接口加载到模型。而 dcp 是需要接受 build 好的 model，然后 inplace 的加载权重。每个rank先申请各自的memory，dcp load的时候每个rank各自的state load到memory)

## 如何使用DCP

这里我们使用一个用   FSDP wrapped model  的玩具模型进行演示。同样，API和逻辑也可以应用于更大的模型进行检查点操作。

### 保存

现在，让我们创建一个玩具模块，用FSDP包装它，用一些虚拟输入数据进行训练，并保存它。

```python
import os

import torch
import torch.distributed as dist
import torch.distributed.checkpoint as DCP
import torch.multiprocessing as mp
import torch.nn as nn

from torch.distributed.fsdp import FullyShardedDataParallel as FSDP
from torch.distributed.fsdp.fully_sharded_data_parallel import StateDictType

CHECKPOINT_DIR = "checkpoint"


class ToyModel(nn.Module):
    def __init__(self):
        super(ToyModel, self).__init__()
        self.net1 = nn.Linear(16, 16)
        self.relu = nn.ReLU()
        self.net2 = nn.Linear(16, 8)

    def forward(self, x):
        return self.net2(self.relu(self.net1(x)))


def setup(rank, world_size):
    os.environ["MASTER_ADDR"] = "localhost"
    os.environ["MASTER_PORT"] = "12355 "

    # initialize the process group
    dist.init_process_group("nccl", rank=rank, world_size=world_size)
    torch.cuda.set_device(rank)


def cleanup():
    dist.destroy_process_group()


def run_fsdp_checkpoint_save_example(rank, world_size):
    print(f"Running basic FSDP checkpoint saving example on rank {rank}.")
    setup(rank, world_size)

    # create a model and move it to GPU with id rank
    model = ToyModel().to(rank)
    model = FSDP(model)

    loss_fn = nn.MSELoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=0.1)

    optimizer.zero_grad()
    model(torch.rand(8, 16, device="cuda")).sum().backward()
    optimizer.step()

    # set FSDP StateDictType to SHARDED_STATE_DICT so we can use DCP to checkpoint sharded model state dict
    # note that we do not support FSDP StateDictType.LOCAL_STATE_DICT
    FSDP.set_state_dict_type(
        model,
        StateDictType.SHARDED_STATE_DICT,
    )
    state_dict = {
        "model": model.state_dict(),
    }

    DCP.save_state_dict(
        state_dict=state_dict,
        storage_writer=DCP.FileSystemWriter(CHECKPOINT_DIR),
    )

    cleanup()


if __name__ == "__main__":
    world_size = torch.cuda.device_count()
    print(f"Running fsdp checkpoint example on {world_size} devices.")
    mp.spawn(
        run_fsdp_checkpoint_save_example,
        args=(world_size,),
        nprocs=world_size,
        join=True,
    )
```

请检查检查点目录。您应该会看到8个检查点文件，如下所示。

```
$1Scheckpoint/
0_0.distcp2_0.distcp4_0.distcp6_0.distcp
1_0.distcp_3_0.distcp_5_0.distcp7_o.distcp
```

### 加载

保存后，让我们创建相同的使用 FSDP wrapped model 的模型，并将保存的状态字典从存储加载到模型中。您可以在相同的 world_size （全局进程个数）或不同的 world_size 下进行加载。

请注意，在加载之前，您需要调用model.state_dict()并将其传递给DCP的load_state_dict() API。这与torch.load()有根本的不同，因为torch.load()只需要加载前检查点的路径。

我们需要在加载之前获取state_dict的原因是：

- DCP使用来自模型state_dict的预分配存储从检查点目录加载。在加载过程中，传入的state_dict将被就地更新。
- DCP需要在加载之前从模型中获取分片信息以支持重新分片。

```python
import os

import torch
import torch.distributed as dist
import torch.distributed.checkpoint as DCP
import torch.multiprocessing as mp
import torch.nn as nn

from torch.distributed.fsdp import FullyShardedDataParallel as FSDP
from torch.distributed.fsdp.fully_sharded_data_parallel import StateDictType

CHECKPOINT_DIR = "checkpoint"


class ToyModel(nn.Module):
    def __init__(self):
        super(ToyModel, self).__init__()
        self.net1 = nn.Linear(16, 16)
        self.relu = nn.ReLU()
        self.net2 = nn.Linear(16, 8)

    def forward(self, x):
        return self.net2(self.relu(self.net1(x)))


def setup(rank, world_size):
    os.environ["MASTER_ADDR"] = "localhost"
    os.environ["MASTER_PORT"] = "12355 "

    # initialize the process group
    dist.init_process_group("nccl", rank=rank, world_size=world_size)
    torch.cuda.set_device(rank)


def cleanup():
    dist.destroy_process_group()


def run_fsdp_checkpoint_load_example(rank, world_size):
    print(f"Running basic FSDP checkpoint loading example on rank {rank}.")
    setup(rank, world_size)

    # create a model and move it to GPU with id rank
    model = ToyModel().to(rank)
    model = FSDP(model)

    FSDP.set_state_dict_type(
        model,
        StateDictType.SHARDED_STATE_DICT,
    )
    # different from ``torch.load()``, DCP requires model state_dict prior to loading to get
    # the allocated storage and sharding information.
    state_dict = {
        "model": model.state_dict(),
    }

    DCP.load_state_dict(
        state_dict=state_dict,
        storage_reader=DCP.FileSystemReader(CHECKPOINT_DIR),
    )
    model.load_state_dict(state_dict["model"])

    cleanup()


if __name__ == "__main__":
    world_size = torch.cuda.device_count()
    print(f"Running fsdp checkpoint example on {world_size} devices.")
    mp.spawn(
        run_fsdp_checkpoint_load_example,
        args=(world_size,),
        nprocs=world_size,
        join=True,
    )
```

如果您想将保存的检查点加载到非分布式设置中的非 FSDP wrapped 的模型中，例如进行推理，您也可以使用DCP来实现。默认情况下，DCP以单程序多数据（SPMD）样式保存和加载分布式状态字典。（对多程序多数据的分布式检查点支持仍在开发中。）

要在非分布式设置中加载，请在使用DCP加载时将no_dist设置为True。

```python
import os

import torch
import torch.distributed.checkpoint as DCP
import torch.nn as nn


CHECKPOINT_DIR = "checkpoint"


class ToyModel(nn.Module):
    def __init__(self):
        super(ToyModel, self).__init__()
        self.net1 = nn.Linear(16, 16)
        self.relu = nn.ReLU()
        self.net2 = nn.Linear(16, 8)

    def forward(self, x):
        return self.net2(self.relu(self.net1(x)))


def run_checkpoint_load_example():
    # create the non FSDP-wrapped toy model
    model = ToyModel()
    state_dict = {
        "model": model.state_dict(),
    }

    # turn no_dist to be true to load in non-distributed setting
    DCP.load_state_dict(
        state_dict=state_dict,
        storage_reader=DCP.FileSystemReader(CHECKPOINT_DIR),
        no_dist=True,
    )
    model.load_state_dict(state_dict["model"])

if __name__ == "__main__":
    print(f"Running basic DCP checkpoint loading example.")
    run_checkpoint_load_example()
```

### 结论

总结，我们已经学会了如何使用DCP的save_state_dict()和load_state_dict()API，以及它们与torch.save()和torch.load()的不同之处。

更多请看：

[Saving and loading models tutorial](https://pytorch.org/tutorials/beginner/saving_loading_models.html)

[Getting started with FullyShardedDataParallel tutorial](https://pytorch.org/tutorials/intermediate/FSDP_tutorial.html)
