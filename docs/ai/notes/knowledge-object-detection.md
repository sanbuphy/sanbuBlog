---
title: "目标检测综述汇总 2022-02-08"
---

## opencv基础

推荐参考：
[基于Python的Opencv全系列速成课](https://www.bilibili.com/video/BV12V411q7Sp/?spm_id_from=333.788)
[3天建立计算机视觉移动应用程序-支持iOS与Android](https://www.bilibili.com/video/BV1Hm4y1X7s9/?spm_id_from=333.788)
[无人机编程与Python教学](https://www.bilibili.com/video/BV11X4y1N7cQ/?spm_id_from=333.788)

项目地址：<https://github.com/jasmcaus/opencv-course>

## 几个大型综述

- [Object Detection in 20 Years: A Survey](http://arxiv.org/abs/1905.05055)

相关笔记：[https://zhuanlan.zhihu.com/p/192362333](https://zhuanlan.zhihu.com/p/192362333)

- [综述：目标检测二十年（2001-2021）](https://blog.csdn.net/qq_29462849/article/details/118231407)
- [目标检测近5年发展历程概述，从R-CNN到RFBNet（2013--2018）](https://www.cnblogs.com/ciao/articles/10892921.html) (韩国人整的)
- 目标检测：Anchor-Free时代 - 陀飞轮的文章 - 知乎 [https://zhuanlan.zhihu.com/p/62103812](https://zhuanlan.zhihu.com/p/62103812)
- CVPR 2021 论文大盘点-目标检测篇 - 我爱计算机视觉的文章 - 知乎 [https://zhuanlan.zhihu.com/p/387510116](https://zhuanlan.zhihu.com/p/387510116)
- 目标检测的精进路径 - mileistone的文章 - 知乎 [https://zhuanlan.zhihu.com/p/266648028](https://zhuanlan.zhihu.com/p/266648028)
- 目标检测入门，看这篇就够了（上） - 最刚烈的文章 - 知乎 [https://zhuanlan.zhihu.com/p/60120331](https://zhuanlan.zhihu.com/p/60120331)
- 国内做深度学习目标检测的有哪些大牛和厉害的课题组？ - Amusi的回答 - 知乎 [https://www.zhihu.com/question/330390445/answer/723973941](https://www.zhihu.com/question/330390445/answer/723973941)

### ICCV 2021 结果出炉！最新200篇ICCV2021论文分方向汇总（更新中）

[https://zhuanlan.zhihu.com/p/392575669](https://zhuanlan.zhihu.com/p/392575669)

[https://zhuanlan.zhihu.com/p/354043252](https://zhuanlan.zhihu.com/p/354043252)

### 7.CVPR2021论文分方向盘点

[https://github.com/extreme-assistant/CVPR2021-Paper-Code-Interpretation#7](https://github.com/extreme-assistant/CVPR2021-Paper-Code-Interpretation#7)

- 一文看尽 27 篇 CVPR2021 2D 目标检测论文 [https://mp.weixin.qq.com/s/Ho7qtrpF9FhHGaamkQo6Lw](https://mp.weixin.qq.com/s/Ho7qtrpF9FhHGaamkQo6Lw)

CVPR 2020 论文大盘点-目标检测篇

[https://bbs.cvmart.net/articles/2732](https://bbs.cvmart.net/articles/2732)

## 其他

- 《目标检测》-第24章-YOLO系列的又一集大成者：YOLOX！[https://zhuanlan.zhihu.com/p/391396921](https://zhuanlan.zhihu.com/p/391396921)
- 目标检测可以先从成熟框架开始上手，比如mmdetection和detectron2。 如果基础。。。。。。目标检测该怎么学呀，目前研一，老师啥也不会，感觉毕不了业了？ - 小小将的回答 - 知乎 [https://www.zhihu.com/question/510784176/answer/2305603811](https://www.zhihu.com/question/510784176/answer/2305603811)
- 系统地学习目标检测可以遵从下面的学习路线：
1.**学习经典工作**。经典工作包括RCNN系列（RCNN、Fast RCNN、Faster RCNN），宏观上可以学习到什么是目标检测、目标检测是做什么的，微观上可以学习到诸如Region Proposal Network（后续one-stage工作的基础）、Anchor box等基础技术。这个系列后来被划定为“two-stage”工作，检测精度好、速度要慢一些。随后，再学习早期的YOLO系列工作（YOLOv1、YOLOv2），宏观上可以学习到什么是one-stage目标检测方法、如何进行端到端的训练和推理，同时，学习SSD，可以初次接触到多级检测方法——使用更多的[特征图](https://www.zhihu.com/search?q=特征图&search_source=Entity&hybrid_search_source=Entity&hybrid_search_extra={"sourceType"%3A"answer"%2C"sourceId"%3A2305881442})去检测不同大小的物体。最后，学习FPN、YOLOv3以及RetinaNet（Focal loss），掌握当下主流检测框架“分而治之”方法。学习玩这些经典工作，最好能从中挑选出一至两个工作，进行复现，那么，目标检测就入门了。目标检测该怎么学呀，目前研一，老师啥也不会，感觉毕不了业了？ - Kissrabbit的回答 - 知乎 [https://www.zhihu.com/question/510784176/answer/2305881442](https://www.zhihu.com/question/510784176/answer/2305881442)
- 目标检测（Object Detection）入门概要[https://blog.csdn.net/f290131665/article/details/81012556](https://blog.csdn.net/f290131665/article/details/81012556)

## Reference

- [目标检测位置回归损失函数整理](https://zhuanlan.zhihu.com/p/112640903)
- [目标检测回归损失函数简介：SmoothL1/IoU/GIoU/DIoU/CIoU Loss](https://zhuanlan.zhihu.com/p/104236411)
- [边框回归(Bounding Box Regression)详解](https://blog.csdn.net/zijin0802034/article/details/77685438)
- [Faster RCNN 中检测框位置回归是怎么做的](https://blog.csdn.net/yangyehuisw/article/details/114918951)
- [目标检测（1）-Selective Search](https://zhuanlan.zhihu.com/p/27467369)
- [第三十三节，目标检测之选择性搜索-Selective Search](https://www.cnblogs.com/zyly/p/9259392.html)
- [Object Detection--RCNN,SPPNet,Fast RCNN，FasterRCNN论文详解](https://blog.csdn.net/u011974639/article/details/78053203?locationNum=7&fps=1)
- [什么是anchor-based 和anchor free？](https://www.sohu.com/a/364671359_100007727)
