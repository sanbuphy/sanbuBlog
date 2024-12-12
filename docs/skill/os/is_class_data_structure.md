---
title : "类vs数据结构 2022-06-25"
---

很多人根据数据结构的定义："Data structure is a storage **that is used to store and organize data**. It is a way of arranging data on a computer so that it can be accessed and updated efficiently. Depending on your requirement and project, it is important to choose the right data structure for your project. "觉得类当然也是一种数据结构，因为符合定义中提到的行为。然而，经过一番查资料外加看了下经典clean coder blog的描述，发现事情没这么简单。

```
对象暴露行为，隐藏数据。便于添加新对象类型而无需修改既有行为，同时也难以在既有对象中添加新行为。数据结构暴露数据，没有明显的行为。便于向既有数据结构添加新行为，同时也难以向既有函数添加新数据结构。

在任何系统中，我们有时会希望能够灵活地添加新数据类型，所以更喜欢在这部分使用对象。另外一些时候，我们希望能灵活地添加新行为，这时我们更喜欢使用数据类型和过程。优秀的软件开发者不带成见地了解这种情形，并依据手边工作的性质选择其中一种手段。

According to that, you can use classes efficiently in two different ways. This phenomenon is called data/object anti-symmetry. Depending on your goals, you have to decide whether your classes will follow the open/closed principle or not.

If they follow the OCP, they will be polymorph, and their instances will be used as objects. So they will hide data and implementation of a common interface, and it will be easy to add a new type which implements that interface as well. Most of the design patterns fulfill the OCP, for example MVC, IoC, every wrapper, adapter, etc...

If they don't follow the OCP, they won't be polymorph, their instances will be used as data structures. So they will expose data, and that data will be manipulated by other classes. This is a typical approach by procedural programming as well. There are several examples which don't use OCP, for example DTOs, Exceptions, config objects, visitor pattern etc...
```

关键还是要看“ 看你抽象了多少、抽象层级、想要对外暴露什么”，并且分析的角度也不同。

潜在的标准答案

[Classes vs. Data Structures](https://blog.cleancoder.com/uncle-bob/2019/06/16/ObjectsAndDataStructures.html)

```
OK, so let me see if I can wrap this up. Classes and Data Structures are opposites in at least three different ways.

Classes make functions visible while keeping data implied. Data structures make data visible while keeping functions implied.
Classes make it easy to add types but hard to add functions. Data structures make it easy to add functions but hard to add types.
Data Structures expose callers to recompilation and redeployment. Classes isolate callers from recompilation and redeployment.
You got it. These are issues that every good software designer and architect needs to keep in mind.

An abstract data type (ADT) is a specification of the desired behaviour from the point of view of the user of the data.

A data structure is a concrete representation of data, and this is from the point of view of an implementer, not a user.
```
