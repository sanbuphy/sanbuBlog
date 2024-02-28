---
title: huggingface 最佳实践
---

## 优雅的下载

### 使用 huggingface-cli 下载

`huggingface-cli download 仓库地址 -local-dir=./models/ --cache-dir=./cache --local-dir-use-symlinks=False --resume-download`

### 使用snapshot下载

如何下载官方仓库等：

[https://zhuanlan.zhihu.com/p/475260268](https://zhuanlan.zhihu.com/p/475260268)

pip install huggingface_hub

```Python
 
from huggingface_hub import snapshot_download
snapshot_download(repo_id="decapoda-research/llama-13b-hf",cache_dir="./cache", local_dir="./model_weights/llama-13b-hf")

```

### 设置镜像下载【推荐】

```C++
import os

# 设置环境变量
os.environ['HF_HOME'] = './cache/'
os.environ['HF_ENDPOINT'] = 'https://hf-mirror.com'
# 下载模型
os.system('huggingface-cli download --resume-download sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 --local-dir /root/data/model/sentence-transformer')
```

### 设置下载地址

通过设置cache_dir的形式 （推荐）`os.environ['HF_HOME'] = './hf-cache'`

from pretrained的api里面也可以加入cache_dir这个参数，效果是一样的。

```Bash
from huggingface_hub import snapshot_download

snapshot_download(repo_id="bert-base-chinese",cache_dir="输入你想下载到的地址")
```

通过环境变量的方式

`export HF_HOME=./cache/`

具体参考文档

```text
Cache Setup:
Pretrained models are downloaded and locally cached at ~/.cache/huggingface/transformers/. 
This is the default directory given by the shell environment variable TRANSFORMERS_CACHE. 
On Windows, the default directory is given by C:\Users\username\.cache\huggingface\transformers. 
You can change the shell environment variables shown below, in order of priority, to specify a different cache directory:
Shell Environment Variable (default): TRANSFORMERS_CACHE
Shell Environment Variable: HF_HOME+/transformers/
Shell Environment Variable: XDG_CACHE_HOME+/huggingface/transformers.
```

## 其他案例

### 转换基础模型并合成lora

```Bash
# checkpoint_path='Stable-diffusion/'
lora_path=''

save_dir='./test'

# python ./scripts/convert_original_stable_diffusion_to_diffusers.py \
    # --checkpoint_path ${checkpoint_path} --dump_path ${save_dir} --from_safetensors
    
python ./scripts/convert_lora_safetensor_to_diffusers.py \
    --base_model_path chill_save_model   --checkpoint_path ${lora_path} --dump_path ${save_dir} --alpha 0.5
```

### 加速下载完整脚本

首先安装依赖 `pip install -U hf-transfer -i <https://pypi.org/simple>

```python
"""
@File         :hf_download.py
@Description  :Download huggingface models and datasets from mirror site.
@Author       :Xiaojian Yuan
"""


import argparse
import os
import sys

# Check if huggingface_hub is installed, if not, install it
try:
    import huggingface_hub
except ImportError:
    print("Install huggingface_hub.")
    os.system("pip install -U huggingface_hub")


parser = argparse.ArgumentParser(description="HuggingFace Download Accelerator Script.")
parser.add_argument(
    "--model",
    "-M",
    default=None,
    type=str,
    help="model name in huggingface, e.g., baichuan-inc/Baichuan2-7B-Chat",
)
parser.add_argument(
    "--token",
    "-T",
    default=None,
    type=str,
    help="hugging face access token for download meta-llama/Llama-2-7b-hf, e.g., hf_***** ",
)
parser.add_argument(
    "--dataset",
    "-D",
    default=None,
    type=str,
    help="dataset name in huggingface, e.g., zh-plus/tiny-imagenet",
)
parser.add_argument(
    "--save_dir",
    "-S",
    default=None,
    type=str,
    help="path to be saved after downloading.",
)
parser.add_argument(
    "--use_hf_transfer", default=True, type=eval, help="Use hf-transfer, default: True"
)
parser.add_argument(
    "--use_mirror", default=True, type=eval, help="Download from mirror, default: True"
)

args = parser.parse_args()

if args.use_hf_transfer:
    # Check if hf_transfer is installed, if not, install it
    try:
        import hf_transfer
    except ImportError:
        print("Install hf_transfer.")
        os.system("pip install -U hf-transfer -i https://pypi.org/simple")
    # Enable hf-transfer if specified
    os.environ["HF_HUB_ENABLE_HF_TRANSFER"] = "1"
    print("export HF_HUB_ENABLE_HF_TRANSFER=", os.getenv("HF_HUB_ENABLE_HF_TRANSFER"))


if args.model is None and args.dataset is None:
    print(
        "Specify the name of the model or dataset, e.g., --model baichuan-inc/Baichuan2-7B-Chat"
    )
    sys.exit()
elif args.model is not None and args.dataset is not None:
    print("Only one model or dataset can be downloaded at a time.")
    sys.exit()

if args.use_mirror:
    # Set default endpoint to mirror site if specified
    os.environ["HF_ENDPOINT"] = "https://hf-mirror.com"
    print("export HF_ENDPOINT=", os.getenv("HF_ENDPOINT"))  # https://hf-mirror.com


if args.token is not None:
    token_option = "--token %s" % args.token
else:
    token_option = ""

if args.model is not None:
    model_name = args.model.split("/")
    save_dir_option = ""
    if args.save_dir is not None:
        if len(model_name) > 1:
            save_path = os.path.join(
                args.save_dir, "models--%s--%s" % (model_name[0], model_name[1])
            )
        else:
            save_path = os.path.join(
                args.save_dir, "models--%s" % (model_name[0])
            )
        save_dir_option = "--local-dir %s" % save_path

    download_shell = (
        "huggingface-cli download %s --local-dir-use-symlinks False --resume-download %s %s"
        % (token_option, args.model, save_dir_option)
    )
    os.system(download_shell)

elif args.dataset is not None:
    dataset_name = args.dataset.split("/")
    save_dir_option = ""
    if args.save_dir is not None:
        if len(dataset_name) > 1:
            save_path = os.path.join(
                args.save_dir, "datasets--%s--%s" % (dataset_name[0], dataset_name[1])
            )
        else:
            save_path = os.path.join(
                args.save_dir, "datasets--%s" % (dataset_name[0])
            )
        save_dir_option = "--local-dir %s" % save_path

    download_shell = (
        "huggingface-cli download %s --local-dir-use-symlinks False --resume-download  --repo-type dataset %s %s"
        % (token_option, args.dataset, save_dir_option)
    )
    os.system(download_shell)
```
