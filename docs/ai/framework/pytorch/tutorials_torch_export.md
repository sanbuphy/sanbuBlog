---
title: torch.export 教程
keywords: ['pytorch']
---

【未施工完毕】

torch.export 及其相关特性目前还处于原型状态,可能会有后向不兼容的改变。本教程为 torch.export 在 PyTorch 2.1 下的版本。

torch.export nightly 教程展示了一些存在于 nightly 二进制文件中的 API,但不在 PyTorch 2.1 版本中。

torch.export 是 PyTorch 2.X 中导出 PyTorch 模型到标准化模型表示的方式,以便在不同(无 Python)环境中运行。

在本教程中,您将学习如何使用 torch.export 从 PyTorch 程序中提取 ExportedProgram(单图表示)。我们还将详细介绍在使您的模型与 torch.export 兼容时可能需要做出的一些注意事项/修改。

更多和使用参考和序列化方法，可以参考：
<https://pytorch.org/docs/stable/export.html>

## 基本用法

torch.export 通过追踪目标函数和示例输入来从 PyTorch 程序中提取单图表示。

```python
torch.export(
    f: Callable,
    args: Tuple[Any, ...],  
    kwargs: Optional[Dict[str, Any]] = None,
    *,
    constraints: Optional[List[Constraint]] = None
) -> ExportedProgram
```

torch.export 追踪从调用 f(*args, **kwargs) 生成的张量计算图,并将其包装在一个 ExportedProgram 中,该程序可以在以后序列化或与不同输入一起执行。请注意,虽然输出的 ExportedGraph 可调用,可以像原始输入可调用对象一样调用,但它不是一个 torch.nn.Module。我们将在后面的教程中详细说明 constraints 参数。

```python
import torch
from torch.export import export

class MyModule(torch.nn.Module):
    def __init__(self):
        super().__init__()
        self.lin = torch.nn.Linear(100, 10)

    def forward(self, x, y):
        return torch.nn.functional.relu(self.lin(x + y), inplace=True)

mod = MyModule()
exported_mod = export(mod, (torch.randn(8, 100), torch.randn(8, 100)))
print(type(exported_mod))
print(exported_mod(torch.randn(8, 100), torch.randn(8, 100)))
```

ExportedProgram 的一些有趣的属性概览:

graph 属性是一个从我们导出的函数追踪得到的 FX 图,即所有 PyTorch 操作的计算图。FX 图有一些重要特性:

操作是“ATen-级别”的操作。
图是“函数化的”,意味着没有操作是可变的。
graph_module 属性是封装了 graph 属性的 GraphModule,这样它可以作为一个 torch.nn.Module 运行。

```python
print(exported_mod)
print(exported_mod.graph_module)
```

```
ExportedProgram:
    class GraphModule(torch.nn.Module):
        def forward(self, arg0_1: f32[10, 100], arg1_1: f32[10], arg2_1: f32[8, 100], arg3_1: f32[8, 100]):
            # 
            add: f32[8, 100] = torch.ops.aten.add.Tensor(arg2_1, arg3_1);  arg2_1 = arg3_1 = None
            permute: f32[100, 10] = torch.ops.aten.permute.default(arg0_1, [1, 0]);  arg0_1 = None
            addmm: f32[8, 10] = torch.ops.aten.addmm.default(arg1_1, add, permute);  arg1_1 = add = permute = None
            relu: f32[8, 10] = torch.ops.aten.relu.default(addmm);  addmm = None
            return (relu,)
            
Graph Signature: ExportGraphSignature(parameters=['L__self___lin.weight', 'L__self___lin.bias'], buffers=[], user_inputs=['arg2_1', 'arg3_1'], user_outputs=['relu'], inputs_to_parameters={'arg0_1': 'L__self___lin.weight', 'arg1_1': 'L__self___lin.bias'}, inputs_to_buffers={}, buffers_to_mutate={}, backward_signature=None, assertion_dep_token=None)
Symbol to range: {}

GraphModule()



def forward(self, arg0_1, arg1_1, arg2_1, arg3_1):
    add = torch.ops.aten.add.Tensor(arg2_1, arg3_1);  arg2_1 = arg3_1 = None
    permute = torch.ops.aten.permute.default(arg0_1, [1, 0]);  arg0_1 = None
    addmm = torch.ops.aten.addmm.default(arg1_1, add, permute);  arg1_1 = add = permute = None
    relu = torch.ops.aten.relu.default(addmm);  addmm = None
    return (relu,)
    
# To see more debug info, please use `graph_module.print_readable()`
```

打印的代码显示FX图仅包含ATen级别的操作(比如torch.ops.aten),并且移除了可变操作。例如,可变操作torch.nn.functional.relu(..., inplace=True)在打印的代码中被表示为torch.ops.aten.relu.default,后者不可变。对原可变relu操作的输入的后续使用被替换为替代非可变relu操作的额外新输出。

ExportedProgram 中其他有趣的属性包括:

- graph_signature -- 导出图的输入、输出、参数、缓冲等。
- range_constraints 和 equality_constraints -- 约束条件,后面会涉及。

```python
print(exported_mod.graph_signature)
```

## 图中断 Graph Breaks

尽管torch.export与torch.compile共享组件,但与torch.compile相比,torch.export的关键限制是它不支持图中断。这是因为处理图中断涉及使用默认Python求值解释不支持的操作,这与导出用例不兼容。因此,为了使您的模型代码与torch.export兼容,您需要修改代码以删除图中断。

以下情况需要图中断:

### 数据依赖控制流

```python
def bad1(x):
    if x.sum() > 0:
        return torch.sin(x)
    return torch.cos(x)

import traceback as tb
try:
    export(bad1, (torch.randn(3, 3),))
except Exception:
    tb.print_exc()
```

### accessing tensor data with .data

```python

def bad2(x):
    x.data[0, 0] = 3
    return x

try:
    export(bad2, (torch.randn(3, 3),))
except Exception:
    tb.print_exc()
```

### calling unsupported functions (such as many built-in functions)

```python
def bad3(x):
    x = x + 1
    return x + id(x)

try:
    export(bad3, (torch.randn(3, 3),))
except Exception:
    tb.print_exc()
```

### unsupported Python language features (e.g. throwing exceptions, match statements)

```python
def bad4(x):
    try:
        x = x + 1
        raise RuntimeError("bad")
    except:
        x = x + 2
    return x

try:
    export(bad4, (torch.randn(3, 3),))
except Exception:
    tb.print_exc()
```

The sections below demonstrate some ways you can modify your code in order to remove graph breaks.

## 控制流操作

torch.export 实际上支持数据依赖控制流。但是这些控制流需要使用控制流操作符来表达。例如,我们可以使用 cond 操作符来修复上面的控制流示例:

.. [TODO] 链接到有关 cond 的文档

from functorch.experimental.control_flow import cond

def bad1_fixed(x):
    def true_fn(x):
        return torch.sin(x)  
    def false_fn(x):
        return torch.cos(x)
    return cond(x.sum() > 0, true_fn, false_fn, [x])

exported_bad1_fixed = export(bad1_fixed, (torch.randn(3, 3),))
print(exported_bad1_fixed(torch.ones(3, 3)))
print(exported_bad1_fixed(-torch.ones(3, 3)))
cond 有一些需要注意的限制:

谓词(即 x.sum() > 0)必须返回一个布尔值或单元素张量。
操作数(即 [x])必须是张量。
分支函数(即 true_fn 和 false_fn)的签名必须与操作数匹配,并且它们都必须返回具有相同元数据(例如 dtype、shape等)的单个张量。
分支函数不能改变输入或全局变量。
分支函数不能访问闭包变量,除非该函数是在方法的作用域中定义的,那么可以访问 self。
.. [NOTE] map 尚未记录 我们还可以使用 map,它将函数应用于第一个张量参数的第一维。

```python
from functorch.experimental.control_flow import map

def map_example(xs):
    def map_fn(x, const):
        def true_fn(x):
            return x + const
        def false_fn(x):
            return x - const
        return control_flow.cond(x.sum() > 0, true_fn, false_fn, [x])
    return control_flow.map(map_fn, xs, torch.tensor([2.0]))

exported_map_example= export(map_example, (torch.randn(4, 3),))
inp = torch.cat((torch.ones(2, 3), -torch.ones(2, 3)))
print(exported_map_example(inp))
```

## 约束条件

操作可以对不同的张量形状具有不同的特化/行为,所以默认情况下,torch.export 要求提供给 ExportedProgram 的输入与提供给初始 torch.export 调用的相应示例输入具有相同的形状。如果我们尝试在下面的示例中用不同形状的张量运行 ExportedProgram,会得到一个错误:

```python
class MyModule2(torch.nn.Module):
    def __init__(self):
        super().__init__()
        self.lin = torch.nn.Linear(100, 10)

    def forward(self, x, y):
        return torch.nn.functional.relu(self.lin(x + y), inplace=True)

mod2 = MyModule2()
exported_mod2 = export(mod2, (torch.randn(8, 100), torch.randn(8, 100)))

try:
    exported_mod2(torch.randn(10, 100), torch.randn(10, 100))
except Exception:
    tb.print_exc()
```

我们可以修改 torch.export 调用来放松一些约束。我们使用 torch.export.dynamic_dim 来手动表达形状约束。

.. [TODO] 当可用时链接 dynamic_dim 的文档

在张量维度上使用 dynamic_dim 将其标记为动态的(即无约束),我们可以提供额外的上下限形状约束。dynamic_dim 的第一个参数是我们希望为其指定维度约束的张量变量。第二个参数指定约束应用于第一个参数的维度。在下面的示例中,我们的输入 inp1 有一个无约束的第一维,但第二维的大小必须在区间 (3, 18] 内。

```python
from torch.export import dynamic_dim

inp1 = torch.randn(10, 10)

def constraints_example1(x):
    x = x[:, 2:]
    return torch.relu(x)

constraints1 = [
    dynamic_dim(inp1, 0),
    3 < dynamic_dim(inp1, 1),
    dynamic_dim(inp1, 1) <= 18,
]

exported_constraints_example1 = export(constraints_example1, (inp1,), constraints=constraints1)

print(exported_constraints_example1(torch.randn(5, 5)))

try:
    exported_constraints_example1(torch.randn(8, 1))
except Exception:
    tb.print_exc()

try:
    exported_constraints_example1(torch.randn(8, 20))
except Exception:
    tb.print_exc()
```

请注意,如果我们提供给 torch.export 的示例输入不满足约束,那么我们会得到一个错误。

```python
constraints1_bad = [
    dynamic_dim(inp1, 0),
    10 < dynamic_dim(inp1, 1),
    dynamic_dim(inp1, 1) <= 18,
]
try:
    export(constraints_example1, (inp1,), constraints=constraints1_bad)
except Exception:
    tb.print_exc()
```

我们还可以使用 dynamic_dim 强制执行预期的维度相等性,例如在矩阵乘法中:

```python
inp2 = torch.randn(4, 8)
inp3 = torch.randn(8, 2)

def constraints_example2(x, y):
    return x @ y

constraints2 = [
    dynamic_dim(inp2, 0),
    dynamic_dim(inp2, 1) == dynamic_dim(inp3, 0),
    dynamic_dim(inp3, 1),
]

exported_constraints_example2 = export(constraints_example2, (inp2, inp3), constraints=constraints2)

print(exported_constraints_example2(torch.randn(2, 16), torch.randn(16, 4)))

try:
    exported_constraints_example2(torch.randn(4, 8), torch.randn(4, 2))
except Exception:
    tb.print_exc()
```

我们实际上可以使用 torch.export 来指导我们需要哪些约束。我们可以通过放松所有约束(回想一下,如果我们不为维度提供约束,默认行为是约束为示例输入的确切形状值)并让 torch.export 报错来做到这一点。

```python
inp4 = torch.randn(8, 16)
inp5 = torch.randn(16, 32)

def constraints_example3(x, y):
    if x.shape[0] <= 16:
        return x @ y[:, :16]
    return y

constraints3 = (s
    [dynamic_dim(inp4, i) for i in range(inp4.dim())] +
    [dynamic_dim(inp5, i) for i in range(inp5.dim())]
)

try:
    export(constraints_example3, (inp4, inp5), constraints=constraints3)
except Exception:
    tb.print_exc()
```

我们可以看到错误消息向我们建议使用一些额外的代码来指定必要的约束。让我们使用该代码(确切代码可能略有不同):

```python
def specify_constraints(x, y):
    return [
        # x:
        dynamic_dim(x, 0) <= 16,

        # y:
        16 < dynamic_dim(y, 1),
        dynamic_dim(y, 0) == dynamic_dim(x, 1),
    ]

constraints3_fixed = specify_constraints(inp4, inp5)
exported_constraints_example3 = export(constraints_example3, (inp4, inp5), constraints=constraints3_fixed)
print(exported_constraints_example3(torch.randn(4, 32), torch.randn(32, 64)))
```

请注意,在上面的示例中,因为我们在 constraints_example3 中约束了 x.shape[0] 的值,即使有原始 if 语句,导出的程序也是合理的。

如果您想了解 torch.export 为何会生成这些约束,可以再次运行脚本,设置环境变量 TORCH_LOGS=dynamic,dynamo,或者使用 torch._logging.set_logs。

```python
import logging
torch._logging.set_logs(dynamic=logging.INFO, dynamo=logging.INFO)
exported_constraints_example3 = export(constraints_example3, (inp4, inp5), constraints=constraints3_fixed)

# reset to previous values
torch._logging.set_logs(dynamic=logging.WARNING, dynamo=logging.WARNING)
```

我们可以使用 range_constraints 和 equality_constraints 属性查看 ExportedProgram 的约束。上面的日志显示符号 s0、s1 等代表什么。

```python
print(exported_constraints_example3.range_constraints)
print(exported_constraints_example3.equality_constraints)
```

我们还可以在源码本身中使用 constrain_as_value 和 constrain_as_size 来约束单个值。constrain_as_value 指定预期给定整数值在提供的最小值/最大值(包括)范围内。如果未提供边界,则假定其无界。

```python
from torch.export import constrain_as_size, constrain_as_value

def constraints_example4(x, y):
    b = y.item()
    constrain_as_value(b, 3, 5)
    if b >= 3:
       return x.cos()
    return x.sin()

exported_constraints_example4 = export(constraints_example4, (torch.randn(3, 3), torch.tensor([4])))
print(exported_constraints_example4(torch.randn(3, 3), torch.tensor([5])))
try:
    exported_constraints_example4(torch.randn(3, 3), torch.tensor([2]))
except Exception:
    tb.print_exc()
```

constrain_as_size 与 constrain_as_value 类似,只是它应该用于将用来指定张量形状的整数值 - 特别是,该值不能为 0 或 1,因为许多操作对形状值为 0 或 1 的张量有特殊行为。

```pyton
def constraints_example5(x, y):
    b = y.item()
    constrain_as_size(b)
    z = torch.ones(b, 4)
    return x.sum() + z.sum()

exported_constraints_example5 = export(constraints_example5, (torch.randn(2, 2), torch.tensor([4])))
print(exported_constraints_example5(torch.randn(2, 2), torch.tensor([5])))
try:
    exported_constraints_example5(torch.randn(2, 2), torch.tensor([1]))
except Exception:
    tb.print_exc()
```

## Custom Ops

torch.export 可以导出具有自定义运算符的 PyTorch 程序。

目前,为 torch.export 使用注册自定义运算符的步骤是:

使用 torch.library[(参考)](https://colab.research.google.com/corgiredirector?site=https%3A%2F%2Fpytorch.org%2Fdocs%2Fmain%2Flibrary.html)定义自定义运算符,与任何其他自定义运算符相同

```python
from torch.library import Library, impl

m = Library("my_custom_library", "DEF")

m.define("custom_op(Tensor input) -> Tensor")

@impl(m, "custom_op", "CompositeExplicitAutograd")
def custom_op(x):
    print("custom_op called!")
    return torch.relu(x)
```

定义自定义运算符的 "Meta" 实现,返回与预期输出相同形状的空张量

```python
@impl(m, "custom_op", "Meta")
def custom_op_meta(x):
    return torch.empty_like(x)
```

使用 torch.ops 从要导出的代码中调用自定义运算符

```python
def custom_op_example(x):
    x = torch.sin(x)
    x = torch.ops.my_custom_library.custom_op(x)
    x = torch.cos(x)
    return x
```

和以前一样导出代码

```python
exported_custom_op_example = export(custom_op_example, (torch.randn(3, 3),))
exported_custom_op_example.graph_module.print_readable()
print(exported_custom_op_example(torch.randn(3, 3)))
```

请注意,在上面的输出中,自定义运算符被包含在导出的图中。当我们将导出的图作为函数调用时,调用了原始的自定义运算符,这可以通过 print 调用看出。

如果您有用 C++ 实现的自定义运算符,请参阅此[文档](https://colab.research.google.com/corgiredirector?site=https%3A%2F%2Fdocs.google.com%2Fdocument%2Fd%2F1_W62p8WJOQQUzPsJYa7s701JXt0qf2OfLub2sbkHOaU%2Fedit%23heading%3Dh.ahugy69p2jmz)以使其与 torch.export 兼容。

## ExportDB

torch.export 只会从 PyTorch 程序中导出一个计算图。由于这个要求,将有一些 Python 或 PyTorch 功能与 torch.export 不兼容,这将需要用户重写模型代码的部分内容。我们在教程前面已经看到了这些示例 -- 例如,使用 cond 重写 if 语句。

ExportDB_ 是记录了 torch.export 支持和不支持的 Python/PyTorch 功能的标准参考文档。它本质上是程序示例列表,每个示例表示使用某个特定的 Python/PyTorch 功能及其与 torch.export 的交互。示例也按类别进行了标记,以便更易搜索。

例如,我们可以使用 ExportDB 来更好地理解 cond 运算符中谓词的工作原理。我们可以查看名为 cond_predicate 的示例,它有一个 torch.cond 标签。示例代码如下:

```python
def cond_predicate(x):
    """
    The conditional statement (aka predicate) passed to ``cond()`` must be one of the following:
      - torch.Tensor with a single element
      - boolean expression
    NOTE: If the `pred` is test on a dim with batch size < 2, it will be specialized.
    """
    pred = x.dim() > 2 and x.shape[2] > 10
    return cond(pred, lambda x: x.cos(), lambda y: y.sin(), [x])
```

更一般地,在出现以下情况时,可以将 ExportDB 用作参考:

在尝试 torch.export 之前,您预先知道模型使用了一些棘手的 Python/PyTorch 功能,并且您希望知道 torch.export 是否覆盖了该功能。
尝试 torch.export 时失败,不清楚如何解决。
ExportDB 不是详尽的,但旨在覆盖典型 PyTorch 代码中找到的所有用例。如果有重要的 Python/PyTorch 功能应该添加到 ExportDB 或由 torch.export 支持,请随时联系我们。

## 结论

我们介绍了 torch.export,PyTorch 2.X 从 PyTorch 程序中导出单个计算图的新方法。特别是,我们演示了为了导出图而需要做出的几个代码修改和注意事项(控制流运算符、约束等)。
