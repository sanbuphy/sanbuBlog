---
title: tmux使用指南
---

简单来说, tmux 的好处是可以在关闭本地的连接终端后,再次进入服务器还可以保存和上次一样的会话状态.

如果你需要更详细的查阅,可参考: <https://www.ruanyifeng.com/blog/2019/10/tmux.html>

## tmux安装

```bash
sudo apt install tmux
```

## tmux常见快捷键

在任何终端,你只需输入 tmux 即可进入界面.

上下分屏: ctrl+b 按下一次后松起再 shift+;

上下分屏后切换屏幕: ctrl+b 按下后松起再加上方向键

tmux 屏幕内滚动: ctrl+b 按下后松起再结合 PgUp 或 PgDn

关闭某个分屏 ctrl+d

切换不同会话: ctrl+s

进入之前的会话: tmux attach
