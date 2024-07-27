---
title: nodejs 前端环境简单配置
---

因为需要使用 nodejs 进行一些网页搭建，这里写了一些基础的部署教程。

<https://nodejs.org/zh-cn/download/package-manager>

官方网站：

## windous

个人不喜欢 windous，但是为了方便，这里也写一下。【特别注意！如果在 windows 下 vscode 需要使用，你需要安装全部后再打开 vscode，否则对于 vscode 来说，只有完全重启整个程序才能够使用更新后的环境变量。。。。】

你需要按照下列方式安装 fnm，类似 nvm 的管理工具。

```
# layouts.download.codeBox.installsFnm
winget install Schniz.fnm

# layouts.download.codeBox.downloadAndInstallNodejs
fnm use --install-if-missing 20

# layouts.download.codeBox.verifiesRightNodejsVersion
node -v # layouts.download.codeBox.shouldPrint

# layouts.download.codeBox.verifiesRightNpmVersion
npm -v # layouts.download.codeBox.shouldPrint
```

由于windwos原因，你还需要在终端输入这句话才能真正启用fnm： <https://github.com/Schniz/fnm?tab=readme-ov-file#windows-command-prompt-aka-batch-aka-wincmd>

安装完毕后，你还需要找到 nodejs 安装目录，然后添加到环境变量。

首先按照该方式进行cache的转移：<https://blog.csdn.net/woyizhizaizhaoni/article/details/103083615>

然后需要把 global 的文件夹目录加入到 windows 的环境变量 path 中，这样你才能使用 npm 安装后的包，比如 bun 或者 gitbook。

```
# in powershell 
fnm env --use-on-cd | Out-String | Invoke-Expression
```

不推荐 cmd。还是最好用 wsl把，别折磨自己了。

## linux

```
# layouts.download.codeBox.installsNvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# layouts.download.codeBox.downloadAndInstallNodejsRestartTerminal
nvm install 20

# layouts.download.codeBox.verifiesRightNodejsVersion
node -v # layouts.download.codeBox.shouldPrint

# layouts.download.codeBox.verifiesRightNpmVersion
npm -v # layouts.download.codeBox.shouldPrint
```

非常简单的操作。

按照上述步骤，你就可以使用 nodejs 了。比如 nvm use 20 , 或者 fnm use 20，代表切换 20 版本的 nodejs。
随后使用 npm 进行对应工具的安装。
