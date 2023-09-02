---
title: 用gitbook部署自己的课件/笔记
---

:::info
gitbook非常适合用来做自己的笔记或者课件存储,可以写出自己的课程或者书籍.

以下是我对于gitbook的简单理解和部署教程:
:::

## 基础环境配置

首先我们需要安装nvm进行指定nodejs版本的安装
你可以使用 nvm (Node Version Manager) 工具来切换已安装的 Node.js 版本。

以下是使用 nvm 切换已安装 Node.js 版本的步骤：

1. 安装 nvm：在终端中运行以下命令安装 nvm：

```Plain Text
Copy Code
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
```

这将从 nvm 的 GitHub 存储库下载并执行安装脚本。

2. 在终端中重新加载你的配置文件（例如 ~/.bashrc、~/.bash_profile 或 ~/.zshrc），以激活 nvm。或者，你也可以手动运行以下命令：

```Plain Text
Copy Code
source ~/.bashrc
```

3. 查看可以安装的 Node.js 版本列表：

```Plain Text
Copy Code
nvm ls-remote
```

这将列出所有可用的 Node.js 版本。

4. 安装所需的 Node.js 版本：

```Plain Text
Copy Code
nvm install <version>
```

将 `<version>` 替换为你想要安装的具体版本号。例如，要安装 Node.js 12.22.1 版本，可以运行：

```Plain Text
Copy Code
nvm install 10.22.0
```

5. 使用特定的 Node.js 版本：

```Plain Text
Copy Code
nvm use <version>
```

将 `<version>` 替换为你想要使用的具体版本号。例如，要使用 Node.js 12.22.1 版本，可以运行：

```Plain Text
Copy Code
nvm use 10.22.0
```

通过执行以上步骤，你可以使用 nvm 在已安装的 Node.js 版本之间进行切换。你可以随时使用 `nvm use <version>` 命令来切换版本。请确保安装的版本在 nvm 支持的版本范围内,注意,有些新的网页框架需要新的node,如果你使用这个版本很可能会冲突,但是别担心,你只要安装比较新的版本比如 `nvm install 16.20.2` 然后 use 切换即可.

## gitbook安装与运行

因为我们在上面的node版本是适配gitbook的,所以只需要按照下列方式进行安装和运行

```bash
npm install -g gitbook
npm install -g gitbook-cli

//初始化一本书
gitbook init

//安装 book json 的插件
gitbook install

//运行服务
gitbook serve
```

以下是我的配置: book.json (这个用来存放各种插件配置,每次更新插件都需要install一次)

```json
{
    "plugins": [ 
        "theme-comscore",
        "flexible-alerts",
        "splitter",
        "sidebar-style",
        "back-to-top-button",
        "code",
        "popup",
        "intopic-toc",
        "katex-plus"

    ],
    "pluginsConfig": {
        "flexible-alerts": {
          "style": "flat"
        },
        "sidebar-style": {
            "title": "标题",
            "author": "作者"
        }
    }
}
```

这里简单介绍一下提示插件,如果你要高亮可以这么写

```
> [!Note|label:这个是学习资料]
>  xxxxxxxx
```

其中label表示覆盖原提示标题,可以写出很漂亮的提示信息,具体可以自己去试试看.

最后简单介绍一下 SUMMARY.md 的作用,我们可以通过这个来规范标题目录:

```
# Summary

* [Introduction](README.md)

* [一、第一章](0.md)
  * [1.测试1](1.md)
  * [2.测试2](2-张量.md)

```

你可以自己尝试,其中md文件对应了你的markdown笔记,除了插件的特殊用法其他和markdown没有任何区别,如果有疑问可以自行查询资料或者在reference中查找.

此外,你可以使用 gitbook pdf 把自己的笔记课件导出成pdf文件,但是你需要先安装calibre依赖:<https://calibre-ebook.com/download_linux>,你可以直接执行这个指令:`sudo -v && wget -nv -O- https://download.calibre-ebook.com/linux-installer.sh | sudo sh /dev/stdin`

## 把笔记部署到 github page 中

我们可以很容易把build的网页部署到 github page上进行对外展示(或者vercel也可以),我们只需要把编译产物 `_book` 文件夹改名为 `docs`,然后在github仓库中的 pages 页面选择这个作为展示文件夹,过一段时间后就可看到对应的网页生效出现.

## Reference

- \[Skill\]GitBook搭建:<http://www.manongjc.com/detail/61-kwqtyouhwddjtax.html>
- 南京大学 计算机科学与技术系 计算机系统基础 课程实验 2021: <https://nju-projectn.github.io/ics-pa-gitbook/ics2021/index.html>
- gitbook创建+部署全指南: <https://blog.csdn.net/thdlrt/article/details/131671465>
- 用 GitBook 编写自己第一本电子书 —— GitBook 的安装和使用 <https://zhuanlan.zhihu.com/p/462773959?utm_id=0>
- Flexible Alerts使用方法: <http://dianyao.co/gitbook-notes/3.%E6%9B%B4%E5%8A%A0%E7%BE%8E%E8%A7%82/%E6%96%87%E6%9C%AC%E5%86%85%E5%AE%B9%E6%9B%B4%E5%8A%A0%E7%BE%8E%E8%A7%82.html>
