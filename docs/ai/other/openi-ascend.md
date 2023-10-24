---
title: openi平台 Ascend 910 微调大语言模型速通指南
---
本篇文章中，我将基于 openi 的 华为昇腾Ascend 910 机器来为你讲解如何微调 llama 以及 chatGLM模型。

## 资料

华为官方资料llama

[https://openi.pcl.ac.cn/MindSpore/mindformers/src/branch/master/docs/model_cards/llama.md](https://openi.pcl.ac.cn/MindSpore/mindformers/src/branch/master/docs/model_cards/llama.md)

llama模型文件下载

[https://openi.pcl.ac.cn/liuzx/alpaca-lora/datasets](https://openi.pcl.ac.cn/liuzx/alpaca-lora/datasets)

注意：如果你不想折腾，可以弄成2.0.0的镜像环境，比默认的镜像环境（1.11坑多）应该好一些

当然，在开始之前，你需要先clone一下初始文件（我们会基于这个库做所有事情，需要安装）

`git clone https://openi.pcl.ac.cn/MindSpore/mindformers.git`

# llama

## 步骤

首先无脑创建一个调试任务，无需挂载数据集和模型。（直接在内部下载）

然后我们需要准备对应的~~模型和~~数据集，此处直接参考这位老哥的：[https://openi.pcl.ac.cn/liuzx/alpaca-lora/datasets](https://openi.pcl.ac.cn/liuzx/alpaca-lora/datasets)

**注意，这里你可以跳过下载llama模型部分！！！！因为实际上微调的时候若模型缺省他会自动下载。。。（只要你的 load_checkpoint:  yaml 参数保持原来的就行，网速很快）**

终端进入后直接去`/home/ma-user/work`下载：

```Shell
wget -O alpaca_dataset.zip "https://s3.openi.org.cn/opendata/attachment/b/1/b1d99d71-181f-4494-9492-2b3327828d84?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=1fa9e58b6899afd26dd3%2F20231024%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20231024T013008Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&response-content-disposition=attachment%3B%20filename%3D%22alpaca-cleaned.zip%22&X-Amz-Signature=f9fc91e3c59bd1f62d8d008652f8c0c5b8d60fd560253d132e802affa29cdfc0"
git clone https://openi.pcl.ac.cn/MindSpore/mindformers.git\

# 这里出问题了 不推荐，你可以自己找方式下载hf的模型
wget -O llama-7b-hf.zip "https://s3.openi.org.cn/opendata/attachment/8/1/81e7cc23-a65c-4925-a7d6-3d3c2c45e304?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=1fa9e58b6899afd26dd3%2F20231024%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20231024T013008Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&response-content-disposition=attachment%3B%20filename%3D%22llama-7b-hf.zip%22&X-Amz-Signature=6a80242aa1cda1e4eb01f587b05de27668f25933ae466f75ba6931d88ef705dd"
```

解压的时候可以开个新的终端进行环境依赖的安装：

```
pip install transformers
pip install "fschat[model_worker,webui]"
```

### ~~预训练权重转换~~

**注意，这里你可以跳过该部分！！！！因为实际上微调的时候若模型缺省他会自动下载。。。（只要你的 load_checkpoint:  yaml 参数保持原来的就行，网速很快）**

~~转换权重，目录根据你的来改，先加环境变量防错。~~

```
export LD_PRELOAD=$LD_PRELOAD:/home/ma-user/anaconda3/envs/MindSpore/lib/python3.7/site-packages/torch/lib/libgomp-d22c30c5.so.1 
```

```
python mindformers/mindformers/models/llama/convert_weight.py \
    --torch_ckpt_dir llama-7b-hf \
    --mindspore_ckpt_path open_llama_7b_v2.ckpt
```

### 数据集转换

把alpaca的单轮对话转成多轮对话。

```
python mindformers/mindformers/tools/dataset_preprocess/llama/alpaca_converter.py \
    --data_path alpaca-cleaned/alpaca_data_cleaned.json \
    --output_path alpaca-data-conversation.json
```

接下来把格式变mindspore支持,由于依赖fschat工具包解析prompt模板，请提前安装fschat >= 0.2.13 python = 3.9

如果你一直在 solve env ，可以试试 conda config --remove-key channels 再继续

然后切换环境安装

```Shell
pip install "fschat[model_worker,webui]"
pip uninstall opencv-python
pip install mindspore decorator opencv-python-headless
pip install tk
# 你还要记得安装下列环境
cd mindformers && pip install -r requirements.txt && python3 setup.py install
```

执行下列转换代码(可能至少等待10min)

```
# 脚本路径：tools/dataset_preprocess/llama/llama_preprocess.py
# 由于此工具依赖fschat工具包解析prompt模板，请提前安装fschat >= 0.2.13 python = 3.9
python mindformers/mindformers/tools/dataset_preprocess/llama/llama_preprocess.py \
    --dataset_type qa \
    --input_glob /home/ma-user/work/alpaca-data-conversation.json \
    --model_file /home/ma-user/work/llama-7b-hf/llama-7b-hf/tokenizer.model \
    --seq_length 2048 \
    --output_file ./alpaca-fastchat2048.mindrecord
```

### 微调

lora微调
目前lora微调适配了llama_7b模型，并给出了默认配置文件config/llama/run_llama_7b_lora.yaml

step 1. 修改配置文件，参考全参微调修改训练数据集路径与预训练权重路径。
step 2. 启动lora微调任务。
注：llama_7b_lora模型支持单卡启动，需将配置文件中的use_parallel参数置为False。

```Shell
# 首先切换回原环境
conda activate MindSpore
# 别忘了安装环境
cd mindformers && pip install -r requirements.txt && python3 setup.py install

# 如果运行发现错误再安装下列环境，否则无需安装。
pip install jieba nltk rouge_chinese
```

如果环境挂了，可以重启机器恢复原来的环境然后再试试看。

最后运行就可以成功跑通！

```Shell
python ./mindformers/run_mindformer.py --config=./configs/llama/run_llama_7b_lora.yaml --use_parallel=False --run_mode=finetune
```

随后你会看到类似`Model Compiling,please wait a Moment`的则表示开始编译，等待十多分钟即可开始运行。

```
 mindformers[callback.py:305] - INFO - { Epoch:[  1/  1], step:[   92/25880], loss: 9.902, per_step_time: 2068ms, lr: 9.92268e-06, overflow cond: False, loss_scale: 262144.0
```

### 参考

感谢以下作者的文章帮助复现

[https://blog.csdn.net/yichao_ding/article/details/133810561](https://blog.csdn.net/yichao_ding/article/details/133810561)

[https://openi.pcl.ac.cn/zhutianci/MindSporeChatGLM2/src/branch/master/LORAllama.md](https://openi.pcl.ac.cn/zhutianci/MindSporeChatGLM2/src/branch/master/LORAllama.md)

# chatglm

通过上面的文章，我们已经很清楚我们需要 1、下载模型转换模型 2、准备数据集 3、修改配置  4、run！

所以我们按照这个顺序进行操作

### 模型下载

注意，由于我的存储空间不够用，这里我直接利用共享内存的挂载点进行模型的下载和使用。(如果你的硬盘存储足够可以直接在 `/home`相关目录下操作）

对于模型下载我们需要注意几个点，

1：我们需要从 [https://huggingface.co/THUDM/chatglm-6b/tree/main](https://huggingface.co/THUDM/chatglm-6b/tree/main) 获取配置信息，你可以把所有除了 .bin 的文件都下载打包放到一个模型文件夹，然后我们还要从魔搭社区获取模型权重的大部分，这些都把他们放在同一个文件夹（非常重要）。`./git-lfs clone clone https://www.modelscope.cn/ZhipuAI/ChatGLM-6B.git` 这里为什么用 git-lfs，后面会说

2：我们需要利用**git-lfs**下载才能获得仓库的大型文件，否则git clone是错误的。但是这里没法直接apt安装，但没关系，这个文件我们可以直接获取编译好的二进制文件：

[https://github.com/git-lfs/git-lfs/releases/download/v3.4.0/git-lfs-linux-arm64-v3.4.0.tar.gz](https://github.com/git-lfs/git-lfs/releases/download/v3.4.0/git-lfs-linux-arm64-v3.4.0.tar.gz)

然后我们把 gitlfs的命令替换掉git的命令即可，如：`./git-lfs clone 仓库地址`

就可以成功获取仓库的文件

### 模型转换

拿到模型后我们需要把模型转换成mindspore的格式，首先对模型进行合并操作：

首先别忘了 `pip install transformers`

```Python
from transformers import AutoModel
import torch as pt

pt_ckpt_path="./ChatGLM-6B"
model = AutoModel.from_pretrained(pt_ckpt_path, trust_remote_code=True, local_files_only=True).half()
pt_pth_path = "./pt_glm_6b.pth"
pt.save(model.state_dict(), pt_pth_path)
```

到这一步还没完，得到pt合成文件后，我们还需要把他转换成mindspore：

```Shell
python mindformers/mindformers/models/glm/convert_weight.py --pt_ckpt_path /dev/shm/pt_glm_6b.pth --ms_ckpt_path /dev/shm/ms_glm_6b.ckpt
```

最后一个ms_glm_6b.ckpt的模型则是我们进行微调的模型，我们需要记录这个地址。

至此你已经完成了最麻烦的一部分，接下来我们只需要简单拿入数据即可。

### 数据准备

这一步非常简单，不需要做额外的转换，我们只需要下载对应的广告数据即可。

`wget -O data.tar.xz 'https://cloud.tsinghua.edu.cn/f/b3f119a008264b1cabd1/?dl=1'`

解压记录地址即可。

### 微调

接下来我们进入激动人心的微调环节，只要环境没问题其实你已经成功了，我们只需要修改5个地方：一处模型的地址，两处数据集的加载地址以及对应的 ice_text model，具体类似：（修改部分节选）

```
seed: 0
run_mode: 'finetune'
load_checkpoint: "/dev/shm/ms_glm_6b.ckpt" 
src_strategy_path_or_dir: ''
auto_trans_ckpt: False  # If true, auto transform load_checkpoint to load in distributed model
only_save_strategy: False
resume_training: False
output_dir: './output'  # 当前不支持自定义修改，请勿修改该默认值

#####################

# ==== dataset config ====
train_dataset: &train_dataset
  data_loader:
    type: ADGenDataLoader
    dataset_dir: "/home/ma-user/work/AdvertiseGen/train.json"
    shuffle: True
    phase: "train"
    origin_columns: ["content", "summary"]
  tokenizer:
    type: ChatGLMTokenizer
    vocab_file: "/dev/shm/ChatGLM-6B/ice_text.model"
  input_columns: ["input_ids", "labels", "position_ids", "attention_mask"]
  max_source_length: 64
  max_target_length: 64
  ignore_pad_token_for_loss: True
  num_parallel_workers: 8
  python_multiprocessing: False
  drop_remainder: True
  batch_size: 1
  repeat: 1
  numa_enable: False
  prefetch_size: 1
  seed: 0

train_dataset_task:
  type: KeyWordGenDataset
  dataset_config: *train_dataset

eval_dataset: &eval_dataset
  data_loader:
    type: ADGenDataLoader
    dataset_dir: "/home/ma-user/work/AdvertiseGen/dev.json"
    shuffle: False
    phase: "eval"
    origin_columns: ["content", "summary"]
  tokenizer:
    type: ChatGLMTokenizer
    vocab_file: "/dev/shm/ChatGLM-6B/ice_text.model"
  max_source_length: 256
  max_target_length: 256
  ignore_pad_token_for_loss: True
  input_columns: ["input_ids", "labels"]
  num_parallel_workers: 8
  python_multiprocessing: False
  drop_remainder: True
  batch_size: 1
  repeat: 1
  numa_enable: False
  prefetch_size: 1
  seed: 0

```

随后直接运行对应的微调配置即可，祝你跑通愉快。

```Shell
python ./mindformers/run_mindformer.py --config=./configs/glm/run_glm_6b_lora.yaml --use_parallel=False --run_mode=finetune
```

### 参考

感谢以下作者的文章帮助复现

[https://blog.csdn.net/yichao_ding/article/details/133805609](https://blog.csdn.net/yichao_ding/article/details/133805609)
