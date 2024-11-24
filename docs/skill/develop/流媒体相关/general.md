---
title: 流媒体相关杂讯
---

## 如何做准确的 FPS 测算

Q：众所周知，有时候我们读取本地的视频信息，他有可能不全（比如直播录像，某些文件内容被破坏或者干脆没有比如）这是一个先有鸡还是先有蛋的问题——你怎么确定fps是对的：是opencv算的（先有了时长）还是说本身fps就是内嵌视频输出的信息而且保证不变然后opencv用这个去计算总时长（因为fps都是基本可以整除的所以基本只能看到opencv给出0.01精确度的时长）

A：求总帧数是最准的，根据总时长可以计算出FPS，这才是最准确的。

## 其他问题：如何看一个视频文件的容器/封装格式？  

答：使用xxd或其他可以看十六进制内容的程序直接打开视频文件，可以看到文件头里面有相关信息直接搜索相关内容（比如在未安装解码器的情况下，海康摄像头直播保存后的文件就是mpeg ps格式，有IMKH header）

## 拉流推流基础知识

直播-拉流和推流概述

[https://www.jianshu.com/p/b520c2a9b795](https://www.jianshu.com/p/b520c2a9b795 "https://www.jianshu.com/p/b520c2a9b795")

## 推拉流常见问题

error while decoding MB 0 14, bytestream 104435 相关问题原因

[https://blog.csdn.net/puffdoudou/article/details/109779624](https://blog.csdn.net/puffdoudou/article/details/109779624 "https://blog.csdn.net/puffdoudou/article/details/109779624")

opencv读取网络摄像头的rtsp流时发生断流现象

[https://blog.csdn.net/qq\_33764934/article/details/103482121](https://blog.csdn.net/qq_33764934/article/details/103482121 "https://blog.csdn.net/qq_33764934/article/details/103482121")
