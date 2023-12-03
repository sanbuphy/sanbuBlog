---
title: 使用vercel部署个人主页
---

首先在这里在此感谢一下本模板的作者：<https://kuizuo.cn/blog/>

大佬教了很多，非常感谢。

本文主要描述了如何使用vercel网站进行个人主页的自动化更新部署（结合github）

## 部署步骤

### 一、vercel的相关设置

首先我们需要注册一个github账户以及[vercel](https://vercel.com/)的账户,

然后右上角点击头像，选择 dashboard 进入如下网站[https://vercel.com/dashboard](https://vercel.com/dashboard)

最后在右侧找到 Add New 的黑色按钮，按下选择 Project ，你将会看到类似这样的字眼：

```
Let's build something new.
To deploy a new Project, import an existing Git Repository or get started with one of our Templates.
```

此时左侧的意思是可以导入一个已有的仓库（可以 yarn 启动），右侧是选择模板。在右侧`Clone Template`可以找到 `Browse All Templates →`

按下后会看到如下字眼：

```

Select a template.
Jumpstart your app development process with our pre-built solutions.
```

你可以选择一个顺眼的模板，或者在github上搜索别人的可用vercel部署的模板（很多人的简单主页都可以直接拿来就用）

然后部署即可（你需要选择一个关联的github仓库让他创建）。部署后你需要等待一段时间，等他右侧进度条全部完成后，就可以在 Dashboard 看到刚才创建好的网页。

点进去后你就可以看到他的运行状况，并给出了托管好的 .app 域名（需要科学上网），如果你想象我一样有一个国内的域名，你需要去腾讯云之类的地方申请一个，然后在这个页面的右上角，Visit 的左侧选择 Domains 即可，在那里你将看到

```
These domains are assigned to your Production Deployments. Optionally, a different Git branch or a redirection to another domain can be configured for each one.
```

你需要在下面填写弄好的域名并设置好对应的DNS就可以在国内访问了。

### 二、本地的相关设置

接下来我们简单学习一下如何在本地调试网站。首先我们知道每一次push到github上就是完成了一次构建过程。
但问题是我们该如何在本地进行调试呢？这时候你需要了解一点前端的知识，首先你需要安装npm和yarn：

参考这个教程可以快速装完和验证:

[https://nodejs.org/en/download](https://nodejs.org/en/download)

[https://blog.csdn.net/xuchaoxin1375/article/details/121709299](https://blog.csdn.net/xuchaoxin1375/article/details/121709299)

安装和验证完毕后，我们需要进入文件夹，然后输入：

```bash
yarn install
```

此时他会根据packages.json安装对应依赖（可以想象成一个makefile+requirement），等待片刻后就可以准备启动网页

```bash
yarn start
```

若成功，此时你会看到一个0.0.0.0的网站已经启动，此时你就可以及时修改代码并及时看到网页变化了（每一次保存都是一次构建）

至此，开始享受你的个人网站之旅把～（坑的还在后面。。。如果你想要图床还需要自己寻找oss，如果都是文字或者图片少那就不用担心。随意找一个稳定的图床都可以满足你的需求。不过我对图片的稳定性和数量都有要求，所以就只能选择图床存储的形式了。）

此外，如果你想知道博客怎么写的一些更细节的规则，推荐你参考：[https://cloud.tencent.com/developer/article/1983048?areaSource=102001.14&traceId=_Xwo4tWbxksIqxGksGMYl](https://cloud.tencent.com/developer/article/1983048?areaSource=102001.14&traceId=_Xwo4tWbxksIqxGksGMYl) 我认为这篇文章写的也非常清楚。

### 三、图床的相关设置

20231119更新：
这里还是建议直接创建一个静态文件部署在vercel上，记得图片要压缩就是了。因为如果走图床你会遇到以下几个问题：

1. 如何防止oss盗刷
2. 使用cdn和cos私有读写回源可以防止盗刷，但是cdn加速域名你至少得有个国内的服务器。。。。。
3. 国内服务器最便宜的一年500，所以我觉得还是能用vercel先用，除非等你的网站确实访问很大了，再谈用图床cdn+国内服务器的好办法。或者除非你可以找到一个有规则可以设置公网流量限制的oss

【注意！】上传前记得统一压缩图片，养成好习惯。

（picGO配合腾讯云COS即可。。）

具体怎么方便修改有个个人心得，你可以这么做：

1. 将图片前面加上前缀，我这里是比如: 230820_title_后面接上图片的原名，按照这个规则批量重命名文件夹中的图片
2. 根据规则批量重命名文章内的索引即可（搜索文章内的图片索引根据我们前面说的名字格式进行批量替换）

注：有时候图片可能文件名内有空格，你要记得把那些空格都替换成%20否则可能无法正常显示，比如 images 20.jpg  要替换成 images%2020.jpg

### 常见脚本

因为转移一些资料和图片修改很浪费时间，这里记录常见脚本：

批量修改当前文件夹图片为jpg并把空格位置变成_ （不支持显示带空格的图片路径）

```python
import os
from PIL import Image
# 保存所有图片为.jpg格式并删除原文件
for filename in os.listdir():
    print(filename)
    if filename.endswith(('.png', '.jpeg', '.gif', '.bmp')):
        img = Image.open(filename).convert('RGB')
        new_filename = filename.split('.')[0] + '.jpg'
        img.save(new_filename, 'JPEG')
        img.close()
        os.remove(filename)
# 检测修改后jpg文件名是否含有空格，有则替换成_
for filename in os.listdir():
    if filename.endswith('.jpg') and ' ' in filename:
        new_filename = filename.replace(' ', '_')
        os.rename(filename, new_filename)

```

## Reference

1. [docusaurus文档](https://www.docusaurus.cn/docs)
2. [\[边写边学系列\] — 超级好用的文档站建站框架 Docusaurus](https://www.zhihu.com/tardis/bd/art/404929066?source_id=1001)
3. [基于 Docusaurus 搭建个人博客，并对主题进行魔改](https://zhuanlan.zhihu.com/p/608149508)
