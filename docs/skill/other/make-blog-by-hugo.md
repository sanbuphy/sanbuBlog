---
title: 如何运用hugo与github.io搭建个人博客 2021-12-28
---

<div style='display: none'>
【这个命令可以注释  相当于markdown中的#
</div>

## 前置要求

1. 你可能需要学习如何使用git，可参考本博中的教程或观看[狂神git简单教程](https://www.bilibili.com/video/BV1FE411P7B3?p=2)。
2. 你也许也想知道怎么利用GitHub Desktop上传东西到github上，可参考[GitHub Desktop 的使用教程](https://blog.csdn.net/lililuni/article/details/83144090)

## 认识hugo

Hugo是由Go语言实现的静态网站生成器。简单、易用、高效、易扩展、快速部署。
中文文档地址：  <https://www.gohugo.org/>
[图文安装教程1](https://blog.csdn.net/shulei00/article/details/105611007)
[图文安装教程2](https://blackstar.pro/posts/%E9%80%9A%E8%BF%87hugo%E6%90%AD%E5%BB%BA%E4%B8%AA%E4%BA%BA%E5%8D%9A%E5%AE%A2/)  

## hugo的结构

[hugo的基本用法和页面改造](https://blog.csdn.net/weixin_44397907/article/details/99621517)  
[hugo中文帮助文档](https://hugo.aiaide.com/)

### 皮肤下载

<https://www.gohugo.org/theme/>
注：我用的是[hahwul](https://github.com/CaiJimmy/hugo-theme-stack/commits?author=hahwul)
写的stack：  <https://github.com/CaiJimmy/hugo-theme-stack>
[主题手册](https://docs.stack.jimmycai.com/zh/configuration/custom-menu.html)

建议安装方法：  

- hugo new site myblog
- 在myblog/config.toml加一行   theme=xxxx（下载后theme文件夹的名）
- 下载放到theme
- 把example的config和yaml覆盖放到首页（首页的config是空的）
- hugo server

### markdown语法检索

<https://www.appinn.com/markdown/#%E5%AE%97%E6%97%A8>
[常见的markdown写法](https://edward852.github.io/post/markdown%E6%94%AF%E6%8C%81%E6%83%85%E5%86%B5%E6%B5%8B%E8%AF%95/)

## 创建你的第一个文章

使用  ``hugo new xxxxx.md``
注意命名时不可以空格，可以用-代替
然后就可以使用 ``hugo server``来查看效果啦！

## 发布你的博客

我们将使用github.io来代替服务器以及域名：[推荐参考教程](https://blog.csdn.net/cbb944131226/article/details/82940224)
几个注意事项：

1. Git要上传或执行的文件可以在文件夹中，右键空白地区点git bash here从而实现目录内操作。
2. 在linux操作中（比如git）粘贴操作是shift+insert或单击鼠标的滚轮。而复制只要选中即可。
3. **【非常重要】**github的域名地址与用户名必须一致，比如你的github名字叫sakura，那么域名必须是sakura.github.io。
4. hugo命令 ``hugo  --baseUrl="https://改为你的名字.github.io/"``执行完后，会生成一个public文件夹，在public文件中执行1.操作即可推送。
5. 用git推送的时候 ``git pull --rebase origin master``语句可能会出错显示没有文件，不用担心，这是因为此时目标仓库是空的，直接下一步最后，你只需要输入对应网址，即可看到自己的宝贝博客了！
6. *（可选）如果你想给博客加上评论系统，请参考这样的流程:[WALINE](https://waline.js.org/guide/get-started.html#html-%E5%BC%95%E5%85%A5-%E5%AE%A2%E6%88%B7%E7%AB%AF)且记得修改config.yaml配置文件中的commit和对应waline项即可

## 更新你的博客

1. 在博客目录下使用 ``hugo  --baseUrl="https://改为你的名字.github.io/"``覆盖原来的public文件夹
2. 进入public文件夹右键git bash
3. 分别执行 git add . // git commit -m '写你的备注' // git push

## 可能存在的问题

### 界面出现404

1. 使用Shift+F5强制刷新页面
2. 检查域名是否和github的名字对应
3. github上存放文件的仓库是否只有一个分支（创建时不要勾选生成README.md)
4. 正常public上传github仓库后会只有一个分支，且包含了public内的所有文件

### 文章看不到

1. 检查是否格式正确，使用了hugo new xxxx.md
2. 检查是否包含了 ``draft: true``，若有则删除或使用 ``hugo server -D``，若草稿模式开启是看不到文章的

### 数学公式不显示

1. 是否使用了 ``math: true``，或尝试导入MathJax包，可参考[Hugo に MathJax を導入して数式を書けるようにする](https://m0t0k1ch1st0ry.com/blog/2017/10/07/mathjax/)或者分离式的mathjax调用方法[HugoでMathJaxを使う](https://kenbannikki.com/notes/using-mathjax-with-hugo/)MathJax的中文文档：<https://www.gohugo.org/doc/tutorials/mathjax/Mathjax的日文文档：https://www.eng.niigata-u.ac.jp/~nomoto/download/mathjax.pdf>

2. 注意此时 ``\\``换行不成功的话，用 ``\\\``试试看，有些 ``\,``的无效也可以用 ``\\,``代替尝试。

3. 有时候数学公式正确也会显示不出来，此时你可以检查**代码界面**或**网页公式处**是否存在斜体如"*_j*"，此时改为"\_j"即可恢复正常，特别是_{}时要注意，可以把开始倾斜的代码（找到这里的"_")改为\_{}就可以正常显示。

### 文章图片加载很慢

1. 可以参考这个文章[Hugo Content 使用图源、压缩与工具介绍](https://www.dazhuanlan.com/twofie/topics/1881524)

### 文章头看到了不同的格式比如+++与---

1. Front Matter支持三种格式，yaml，toml与json方式，你可以参考：[基础文件和头部格式介绍](https://blog.csdn.net/sunjinfu19841120/article/details/88956372)

### git push不成功

1. 此时大概率是网络通信有问题，可以关掉git终端后科学上网；重启git 终端后（windows需要，linux系统不需要）再进行push大概率就可以解决问题了；此时无需再进行git init 等初始化操作因为之前已经做完。
