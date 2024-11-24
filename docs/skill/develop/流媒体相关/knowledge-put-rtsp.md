---
title: 利用笔记本电脑将本地摄像头内容推送给同网段的其他电脑 2022-07-31
---

开始测试多线程的检测与英伟达板卡拉流压力测试，摄像头不够就用笔记本上。本文实现功能：

将本地摄像头作为设备获取图像，用电脑建立服务器推送rtsp流并在其他同网段电脑下拉流。

使用软件:

- FFmpeg(音视频编解码)
- EasyDarwin(流媒体服务器)

完整参考以下文章即可：（记得推送IP要改成指定的一个IP，而不是127那指的是本地IP）

如果不能连接，除了ping之外还要用curl ip:port或者telnet等检测，如果不行就把推流机的公共防火墙关闭。（之前我没有关闭防火墙是不能拉流的）

如果用的是ubuntu拉流，还要看看是不是虚拟网卡有所影响（虚拟网卡的ip不同可能访问策略优先）

- [流媒体服务器配置与管理——使用FFmpeg推流到EasyDarwin中再通过VLC观看](https://blog.csdn.net/NOWSHUT/article/details/108540109)

- [EasyDarwin+ffmpeg进行PC(摄像头+麦克风)流媒体直播服务](https://blog.csdn.net/weixin_30455365/article/details/97686191)

- [ffmpeg--使用命令+EasyDarwin推流笔记本摄像头](https://blog.csdn.net/fkbiubiubiu/article/details/124028614)

- [EasyDarwin开源流媒体服务器](https://github.com/EasyDarwin/EasyDarwin)
