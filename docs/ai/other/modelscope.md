---
title: modelscope 最佳实践
---

模型下载

```
import torch
from modelscope import snapshot_download, AutoModel, AutoTokenizer
import os
model_dir = snapshot_download('qwen/Qwen2-7B-Instruct', cache_dir='/root/autodl-tmp', revision='master')
```

使用最新的 cli API 可以加速我们的模型下载

指定下载cache_dir

```
modelscope download --model 'AI-ModelScope/gpt2' --cache_dir './cache_dir'
```

过滤指定文件

```
modelscope download --model 'AI-ModelScope/gpt2' --exclude 'onnx/*' '*.tflite' 
```
