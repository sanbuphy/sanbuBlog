---
title: 快速翻译总结视频内容工作流
---

相信大家在日常听lab一定有这样的困扰，实时翻译不够准确、不够通顺、不够快。我也深受其困扰，如果有个东西能够给出结构化大纲和全文，我们可以很快速的利用他形成自己的知识笔记。

以下内容我将以 youtube 的视频展开，你可以使用他翻译总结任何英文相关的视频。

## 一、视频下载

首先我们要把 youtube 的视频下载到本地，在这里我使用的是[这个下载](https://youtubemultidownloader.net/)（你只要用里面的下载就好，其他广告内容不必看）。

## 二、视频转录

在这里你可以使用任意 whisper 相关程序软件（之后我会找到一个轻量化的开源pipeline，但是这里我先用autocut代替，此时你需要显卡；你也可以找到其他靠谱的全英文转录工具来完成这件事情）

这里我使用的是李沐老师开源的 autocut，其实你不必使用这么重的程序，只是我用习惯了。原版没有输出全部的功能，我自己改了一下，支持了默认输出全文：

<https://github.com/sanbuphy/autocut-dev>

转录全英文是为了保证完整和正确性，然后最后你会得到一个markdown文档，你可以把他变成txt文档或者是其他（我为了快速验证还没有写，但这个很简单，相信你可以自己完成）

我的运行指令如下： `autocut --lang en --whisper-model large-v2 -t 这里写待转录文件名`

## 三、开始翻译

在第二步后我们有了个全英文文件，这里你可以用下面的例子代替，我们接下来的任务是把这个段落投喂给GPT的到最后的翻译结果

:::info
注意，分段是必须的，因为GPT上下文有限，这里我没有精确计算具体用的token数，理论上你可以得到一个好的值最大化利用率。

值得注意的是，有时候分段并不是原生完美，这时候你可以自己写代码计算token并分段
:::

```
My name is Alban, and today for this quick lightning talk, I'm going to give you the,state of my torch presentation.,I've been at the conference before, maybe you have seen.,iterations of this talk. We are doing it every year.,I did it last year.,The other thing is, yes, State of Byteorch,,where we're talking about everything that has happened.,some numbers and some,call for actions for you to help us.,For those of you that don't know me, I'm Albin.,I've been working on Playtorch for quite a long time,,and I'm a software engineer at Meta.,And I work a lot on the maintenance of core libraries for PyTorch.,Three big things I want to talk about today.,Three of the big PyTorch milestones and what happened this year.,big events that we had.,PyTorch numbers, so some interesting numbers.,Joe gave you a sneak peek at a couple of these,,but it's always fun to see these things.,And a code correction for everyone,,on how can you get involved and how can you help us.,First and a big Pytorch milestone was Pytorch 2.0 that was released earlier this year.
more than 20 million downloads across all platforms.,So it's a pretty significant release for us.,The number of downloads are keep,It adds a bunch of very important features.,I don't think I need to go over it again because we've talked about it.,We're going to talk about it more.,An important one was the MPS backend.,So to leverage the GPU part of the M1 M2 chip from Apple,is now in beta phase, so with a lot more coverage, a lot more stability.,new features supported.,Torch.torch, which was func torch for the people that know about this.,It's adding a functional API.,Jacks has for example.,Staying within the PyTorch world, so executing in eager and working with all the other features that,A set default device, which I don't know if many of you are familiar with, it's all about,changing what is a default device being used when you build your PyTorch model, create,your model, that can help significantly to speed up initialization, for example, by directly,initializing on device, or as you've seen in some of the keynote example very quickly,

```

在这里我们给出了两端文本，接下来我将演示如何使用 GPT 调用接口返回他的翻译信息，参考代码如下：

```python
from openai import OpenAI
client = OpenAI(api_key = "这里写你的key")
# 设置你的 OpenAI 访问密钥
def translate_text(text):
    # 设置 ChatGPT 的输入参数

    completion = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=[
        {"role": "system", "content": "你是一个英文翻译大师，你要帮我把我给你的英文讲座全部翻译成中文，因为是演讲有些可能不通顺你要让他语句通顺，直接返回翻译后的结果即可."},
        {"role": "user", "content": text}
    ]
    )
    # 解析翻译结果
    translations = completion.choices[0].messag e
    return translations

def split_file_by_paragraphs(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        text = file.read()

    paragraphs = text.split('\n')  # 假设每一行就是一个段落
    return paragraphs

def main(file_path = 'test.txt',output_path = 'output.txt'):
    # 替换为您的输入文本文件路径
    paragraphs = split_file_by_paragraphs(file_path)

    with open(output_path, 'w', encoding='utf-8') as output_file:
        for paragraph in paragraphs:
            output_file.write(translate_text(paragraph).content + '\n\n')
            print("写入成功！")

if __name__ == '__main__':
    main()    
```

你需要到[OpenAI 官网](https://platform.openai.com/api-keys)获取你的 apikey 信息，然后填入对应位置，随后直接运行即可【记得要科学上网】

很快你会得到一个 output.txt 文件，内容如下

```
我的名字是阿尔班，今天在这个快速闪电演讲中，我将为大家呈现关于我所在领域的现状。也许你们之前见过我在这个会议上做的演讲的一些版本，我们每年都会进行这样的演讲，去年我也做过。还有一件事，是关于Byteorch的现状，我们将讨论发生的一切，包括一些数字和对你们提出的一些行动要求，帮助我们。对于那些不认识我的人，我叫阿尔宾，我在Playtorch上工作已经有很长时间了，我是Meta的一名软件工程师，并且我在PyTorch的核心库的维护工作上投入了很多时间。今天我想谈论的是三个重要的PyTorch里程碑以及今年发生的事情，我们拥有的重要事件。接下来是一些有趣的PyTorch数字，Joe已经给大家看了一些预告，但是看到这些东西总是很有趣。最后是关于大家如何参与以及如何帮助我们的代码修正。首先，一个重要的PyTorch里程碑是今年早些时候发布的PyTorch 2.0。

在所有平台上的下载量超过了2000万次。对我们来说，这是一个相当重要的发布。下载量一直在增加。它增加了一些非常重要的功能。我认为我不需要再重复一遍，因为我们已经谈论过了。我们将继续讨论这个。其中一个重要的功能是MPS后端。为了充分利用苹果M1 M2芯片的GPU部分，现在处于测试阶段，覆盖范围更广，稳定性更高。支持新的功能。对于了解这个的人来说，Torch.torch是func torch的替代品。它添加了一个功能API。例如，Jacks等。保持在PyTorch世界中，所以可以在即时执行并与所有其他功能一起工作。还有一个set default device，我不知道你们中有多少人熟悉它，它涉及到在构建PyTorch模型、创建模型时更改默认的设备使用情况，例如，通过直接在设备上进行初始化，或者如你们在一些主题演讲示例中所看到的那样，迅速初始化。

```

至此翻译阶段完成，你可以修改这些代码让他更符合你的工作流。

## 四、进行总结

仅仅有了全文，其实是不够的，因为我们没办法很好的直接得到全貌，这不利于我们记忆和查询。但是在这个时候短时间内我们是不可能用gpt帮我们作总结了，因为我们上下文有限制，如果我们用一些工具比如langchain当然可以进一步做到更多操作，但是有没有比较容易的方法能够快速得到我们想要的呢？这里我建议你使用 [claude](https://claude.ai/) ，你只需要直接把转录全文加上一些prompt丢进区即可，类似：

```
你现在是一个总结大师，你需要按照我的要求总结所有文本，然后按照以下类似的格式 markdown的形式返回给我，总结后的例子如下：

## 大纲

1. 讲座背景介绍  
2. AOT Inductor的目标和意义
3. AOT Inductor技术实现方法
    - Compiler部分
    - Runtime部分  
4. AOT Inductor的性能
    - 通过率
    - 速度提升
5. AOT Inductor的使用
   - 如何编译并部署模型
6. 未来方向

## 详细要点  

### 1. 背景介绍

- Mark在前一个讲座中谈到了Python推理的难点  
- 相比训练,推理场景更加复杂多样
- 有些场景需要更可预测的运行时性能,因此可能不选择Python部署  

### 2. AOT Inductor的目标和意义

- 提供一种不使用Python的模型部署方案
- 输入是Torch导出的模型
- 编译为可部署的C++库  

### 3. 技术实现  

- Compiler部分
  - 重用JIT Compiler的Lowering和优化逻辑
  - 修改Code Generation部分:生成C++ Wrapper代码和CUDA内核
- Runtime部分  
  - 提供多线程模型服务
  - CUDA streams并发  

### 4. 性能  

- 3个基准套件上的通过率大于90%
- 与Eager模式相比,速度提升高于JIT Inductor  

### 5. 使用方法

- PyTorch导出并AOT编译模型  
- 在C++中加载编译库并执行推理  

### 6. 未来方向

- 更多的性能优化  
- 完善文档和教程·

你需要总结的文本如下,记住请使用markdown 的格式返回给我，把返回写在一个代码块里面。
【这里粘贴 test.txt 也就是你想要让他总结的全文，最好是英文】

```

最后你会得到类似这样的返回值：

```

## 大纲  

1. 讲座背景介绍
2. PyTorch 2.0重要功能  
3. 代码贡献情况
4. PyTorch基金会最新情况  
5. PyTorch社区规模  
6. PyTorch应用情况   
7. 如何参与贡献  
8. 即将举办活动

## 详细要点

### 1. 讲座背景介绍

- 讲者Alban是PyTorch核心库维护者  
- 他在PyTorch年会上已连续多年主讲

### 2. PyTorch 2.0重要功能

- 今年早些时候发布  
- 新增多项重要功能
- 下载量超过2000万

### 3. 代码贡献情况  

- 12000+ commits
- 1128名贡献者 
- 开源贡献增长8%  

### 4. PyTorch基金会最新情况

- 6月对外开放会员  
- 已有6家新会员
- 会员背景多样化

### 5. PyTorch社区规模

- 60万个GitHub项目使用  
- 论坛活跃度高  

### 6. PyTorch应用情况   

- 学术研究领域占主导地位 
- 行业需求快速增长  

### 7. 如何参与贡献  

- 社区反馈很重要
- 代码贡献非常欢迎  

### 8. 即将举办活动

- 下月将举办文档松活动
```

## 其他

至此大概流程结束，也许喜欢的人多我会把他放到文心一言上做成pipeline给大家调用～

这只是一个节约时间的方法，但真正需要的还是认真去阅读，希望他可以让你更集中精力到思考本身。
