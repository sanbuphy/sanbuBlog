---
title: 科研路上的思考与实践(转载 Junyi Hou)
---

Junyi Hou earned a Master of Computing in Computer Science from the National University of Singapore (NUS). He is currently a Research Assistant in the Systems & Networking Research Lab at NUS, supervised by Prof. Bingsheng He. <https://profile.junyi.dev/>

# 读 Paper

看 paper 解决什么问题，比看它用什么方法要更重要

有创新吗？如果大家都是这么做的，就不算创新。（如果要其他人做这个事情，其他人也会这么做）

回答下面三个问题：

这个 paper 的 contribution 是什么？
为什么这个 paper 可以中？
这个 paper 的 weakness 在哪里？
思考一下，如果让你跟这篇 paper 做 exactly 一样的工作，你会跟他用一样的方法吗？

# 想 Paper

我们的工作要吸引真正的用户使用，在过程中发现参数设置是否合理。要仔细考虑怎么去 incentive 其他人去使用我们的项目，来探索领域内的相关场景。

如果有1000人用你的项目，这是个什么样的项目呢？怎么让他们心甘情愿为社区做贡献？

Re-search重新-找，在你想问题的时候得问自己：

“paper 想全了吗？”

“feature 都找出来了吗？”

”为什么有这么多 feature ?“

“这些 feature 是可以拍脑袋想的吗？”

“时刻记着 garbage in garbage out.”

当你看到一个 metric 的时候：

It’s important to have a methodology to analysis.

# 讲 Paper

不要只讲他怎么做的，要用自己的语言 summarize 它

（告诉一些新人）我们应当关注以下问题：

what’s the problem?

what’s the solution?

what’s the key message in your slides? (为了xxx，你到底想说啥？)

当老师给你说一件事的时候，你 24 小时之内应该去做，不要想那么多。或者给老师一个 timing 的回复。 「比如让你 “联系 XX 老师” 的时候，最好 24 小时内就去联系」

# 写 Paper

写 paper 的时候自己觉得 exciting 才能写得好！

思考自己的 Research contribution 在什么地方？ What’s new here？

别人读完你的 paper，学到了什么（比如你可以在 conclusion 写一段话，表示自己在这个领域有什么贡献）

reviewer 读这一段的时候，会想得到什么信息？

流程创新的，需要在流程里的有个核心步骤，并且说出来创新点在哪里。

我这篇paper为什么被拒？想一下为什么 reviewer 说我 novelty 不够？没事，很多paper都可以被说 novelty 不够 (Fig.1)

选数据是一个非常慎重的事情

I’m sure someone will ask “but won’t that get my idea stolen?”. I’ve heard anecdotally of that happening, but not to me or anyone I know in my field. Most likely because the idea is only the first tiny piece of the thesis: the idea is always followed by a significant investment of labor to execute and evaluate. The people you talk to are too busy with their own work to invest all that labor on your idea. But they’ll be happy to give you feedback on it.

# 实验文件管理体系

文件管理体系
数据集文件夹使用统一的文件结构，用于存放各种数据集。（与项目无关）

/home/junyi/data/mnist/
/home/junyi/data/cifar10/
/home/junyi/data/covtype/
项目文件夹针对每一个项目单独设立（例如VertiBench和VertiLearn）

/home/junyi/project/VertiBench/
/home/junyi/project/VertiLearn/
        ./experiment/ # 实验文件夹
        ./experiment/{exp-name}-{timestamp}/*.log
        ./data/       # 软链接到数据集
        ./code/        # 项目的仓库 / 相关代码
        ./rebuttal/   # 回复 Reviewer 的
        ./rebuttal/{reviewer-id}/experiment/
        ./rebuttal/{reviewer-id}/plot/
        ./rebuttal/{reviewer-id}/comment/

## 如何做实验

⭐️ 自动化: 跑太多的实验真的很麻烦，特别是出问题需要重跑特定的实验时会让人头大。我坚决反对手工操作，即使做手工实验，也务必记录每一个实验命令。

使用脚本: 我靠脚本实现自动化，用一个脚本来管理所有的实验，每个实验都会被分配一个唯一id。这样在某个实验出错时，例如显存不足，我可以直接根据 id 重新运行该实验（特别是在使用 slurm 的时候，有这样的脚本可以省去不少写 sbatch 的工作）。同时，我还有另一个脚本用来追踪每个实验的进度（打印进度条）。

日志要 print 完整: 每次实验都确保打印所有的参数，每一行的开头都要有时间（精确到秒），打印的内容包括模型的超参数和结构，并且把 parse 的 args 都打印出来。当实验变得复杂并且时间有限时，这种详细的记录非常有助于我回顾。（如果实验名足够详细，其实在日志里也没必要打印这么多内容）

为实验命名: 为了方便查找，每次实验我都会给它一个描述性的名字，如 “test SplitNN with lr 0.3”。

使用 git: 为了尽快得到结果，我不得不在多台机器上进行实验，这让我非常非常头痛。建议使用 git 来完成多个机器的代码同步。（不建议用 git 来同步数据集🤣）

## Reference

<https://www.junyi.dev/posts/research-101/>

<https://www.junyi.dev/posts/ra-experience/>
