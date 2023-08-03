---
title: 开源软件创新大赛Paddle性能优化 赛题9
keywords: ['paddle']
---
本文参考：[https://hackmd.io/@4wbe4ERfQYOfZ6CegqwhzQ/HJxZHIfo2](https://hackmd.io/@4wbe4ERfQYOfZ6CegqwhzQ/HJxZHIfo2)

特别感谢：婷姐、son师傅、张师傅

## 学习资料

汪汪队任务
【开源软件创新大赛题目9】[https://github.com/PaddlePaddle/Paddle/issues/55663#paddlepaddle09](https://github.com/PaddlePaddle/Paddle/issues/55663#paddlepaddle09)

- tracking issue [https://github.com/PaddlePaddle/Paddle/issues/55907](https://github.com/PaddlePaddle/Paddle/issues/55907)

包含模型瓶颈的辨别方法和基本分析思路及对应的工具。

- Paddle的性能调优：[https://www.paddlepaddle.org.cn/documentation/docs/zh/guides/performance_improving/index_cn.html](https://www.paddlepaddle.org.cn/documentation/docs/zh/guides/performance_improving/index_cn.html)

- Paddle Profiler:[https://www.paddlepaddle.org.cn/documentation/docs/zh/guides/performance_improving/profiling_model.html](https://www.paddlepaddle.org.cn/documentation/docs/zh/guides/performance_improving/profiling_model.html)

- timeline分析工具：[https://github.com/Xreki/PaPerf](https://github.com/Xreki/PaPerf)

- 其他框架实现：[https://github.com/open-mmlab/mmdetection](https://github.com/open-mmlab/mmdetection)

【Paddle的性能优化wiki】[https://github.com/PaddlePaddle/Paddle/wiki/Performance-Optimization-in-PaddlePaddle](https://github.com/PaddlePaddle/Paddle/wiki/Performance-Optimization-in-PaddlePaddle)

【算子优化RFC】[https://github.com/PaddlePaddle/community/tree/master/rfcs/OPs-Perf](https://github.com/PaddlePaddle/community/tree/master/rfcs/OPs-Perf)

## 提示

1、修改的原则是没改变模型结构，不影响训练精度指

2、对于dataloader的参数配置，可以调，但是调之前应该问一个问题，有没有必要调，模型现在读数据的过程是它的训练瓶颈吗？如果是，应该调什么参数会加快数据的读取

3、分析方法：分析一下它训练时间的构成，有几大部分，占比如何？去分析每一个过程是不是有瓶颈，借助Profile和nsight 工具分析，找到优化动机，解决对性能影响最大的那些问题，才有可能提升速度。

4、想单独生成timeline就给这个改成True：（参考paddle[性能优化工具文档](https://www.paddlepaddle.org.cn/documentation/docs/zh/guides/performance_improving/profiling_model.html#kaiqixingnengfenxiqi-dingweixingnengpingjingdian)）

性能分析会影响timeline的生成，就是性能分析也会占一些时间，所以单独要timeline的时候还是给这个设置为True比较好。

如果要产出timeline，记得设置timer_only=True，目前是Paddle的Profiler和nsys的封装这两个工具没有做好统一，所以同时启用分析会有问题。暂时的方案就是使用某一个工具，就先把另一个注释掉。或者要用nsys，就把Paddle Profiler设置为timer_only=True也行。

```
python tools/train.py -c configs/mask_rcnn/mask_rcnn_r50_1x_coco.yml -o LearningRate.base_lr=0.0001 log_iter=1 use_gpu=True save_dir=./test_tipc/output/mask_rcnn_r50_1x_coco/benchmark_train/norm_train_gpus_0_autocast_fp32 epoch=1 pretrain_weights=https://paddledet.bj.bcebos.com/models/mask_rcnn_r50_1x_coco.pdparams TrainReader.batch_size=2 filename=mask_rcnn_r50_1x_coco TrainReader.shuffle=False --enable_ce=True > profier.txt
```

## 环境准备

### PaddleDetection 环境安装

一键安装需要的ppdet

```Shell
echo 'export LD_LIBRARY_PATH="/usr/lib64:$LD_LIBRARY_PATH"' >> ~/.bashrc
source ~/.bashrc
git clone https://github.com/PaddlePaddle/PaddleDetection.git
git checkout develop  # 一定要切换到这个分支否则会有bug，或者clone 的时候指定分支
python -m pip install paddlepaddle-gpu==2.5.0 -ihttps://pypi.tuna.tsinghua.edu.cn/simple
cd PaddleDetection
pip install -r requirements.txt --user -i https://pypi.tuna.tsinghua.edu.cn/simple
python setup.py install --user
python ppdet/modeling/tests/test_architectures.py
```

注意 这里如果不--user也会有权限问题，你也可以用虚拟环境的方法解决（有点麻烦）

你需要按照这个创建虚拟变量（不需要sudo）

```Shell
python3 -m venv --without-pip env
source env/bin/activate
wget https://bootstrap.pypa.io/get-pip.py
python get-pip.py
deactivate
source env/bin/activate
which python
which pip
```

然后每次用python -m pip 之类的进行依赖安装即可

### 测试环境准备

```Shell
# 提前下载一个小型的coco数据集用于测试
wget -nc -P ./dataset/coco/ https://bj.bcebos.com/v1/paddledet/data/cocomini.zip --no-check-certificate
cd ./dataset/coco/ && unzip cocomini.zip
mv -u cocomini/* ./

# benchmark tool
wget https://paddle-qa.bj.bcebos.com/benchmark/tools.tar.gz && tar xvf tools.tar.gz && export BENCHMARK_ROOT=$PWD/tools/

# test_tipc 在 PaddleDetection目录下 需要回去
bash test_tipc/prepare.sh test_tipc/configs/mask_rcnn/mask_rcnn_r50_1x_coco_train_infer_python.txt benchmark_train;
bash test_tipc/benchmark_train.sh test_tipc/configs/mask_rcnn/mask_rcnn_r50_1x_coco_train_infer_python.txt benchmark_train dynamic_bs2_fp32_DP_N1C1;
```

dynamic_bs2_fp32_DP_N1C1，表示的是bs=2,fp32训练，N1C1单机单卡。如果要换bs，就相应改为dynamic_bs4_fp32_DP_N1C1；换amp训练就改为dynamic_bs2_fp16_DP_N1C1

这里建议你按照自己的显存量力而为。。。如果是12G我建议你还是用混合精度不然大概率显存爆炸。
（你可以在profile_log文件夹中查看产生的记录）

若成功，你会看到类似如下输出：

```Plain Text
145386 loss_bbox_reg: 0.246582 loss: 1.553033 eta: 5:08:22 batch_cost: 0.6703 data_cost: 0.0005 ips: 2.9839 images/s
[07/29 19:19:26] ppdet.engine INFO: Epoch: [0] [   16/25000] learning_rate: 0.000002 loss_mask: 0.917820 loss_rpn_cls: 0.090034 loss_rpn_reg: 0.080017 loss_bbox_cls: 0.121643 loss_bbox_reg: 0.253906 loss: 1.463421 eta: 5:07:53 batch_cost: 0.7219 data_cost: 0.0003 ips: 2.7706 images/s
[07/29 19:19:27] ppdet.engine INFO: Epoch: [0] [   17/25000] learning_rate: 0.000002 loss_mask: 0.814945 loss_rpn_cls: 0.049273 loss_rpn_reg: 0.082642 loss_bbox_cls: 0.093506 loss_bbox_reg: 0.127563 loss: 1.167929 eta: 5:05:55 batch_cost: 0.6546 data_cost: 0.0003 ips: 3.0555 images/s
[07/29 19:19:28] ppdet.engine INFO: Epoch: [0] [   18/25000] learning_rate: 0.000002 loss_mask: 0.458601 loss_rpn_cls: 0.082942 loss_rpn_reg: 0.284180 loss_bbox_cls: 0.108398 loss_bbox_reg: 0.105347 loss: 1.039468 eta: 5:05:16 batch_cost: 0.7054 data_cost: 0.0003 ips: 2.8354 images/s
[07/29 19:19:28] ppdet.engine INFO: Epoch: [0] [   19/25000] learning_rate: 0.000002 loss_mask: 0.386661 loss_rpn_cls: 0.159092 loss_rpn_reg: 0.166016 loss_bbox_cls: 0.294922 loss_bbox_reg: 0.301758 loss: 1.308448 eta: 5:04:11 batch_cost: 0.6818 data_cost: 0.0004 ips: 2.9334 images/s
============================================Perf Summary============================================
Reader Ratio: 0.041%
Time Unit: s, IPS Unit: steps/s
|                 |       avg       |       max       |       min       |
|   reader_cost   |     0.00031     |     0.00047     |     0.00018     |
|    batch_cost   |     0.74743     |     0.73269     |     0.63196     |
|       ips       |     1.33792     |     1.58238     |     1.36484     |

```

之后再等待一会儿，你会看见如下输出：

```Plain Text
python /home/sanbu/github/PaddleDetection/dataset/coco/tools//scripts/analysis.py --filename /home/sanbu/github/PaddleDetection/train_log/PaddleDetection_mask_rcnn_r50_1x_coco_bs2_fp16_DP_N1C1_log                         --speed_log_file '/home/sanbu/github/PaddleDetection/index/PaddleDetection_mask_rcnn_r50_1x_coco_bs2_fp16_DP_N1C1_speed'                         --model_name mask_rcnn_r50_1x_coco_bs2_fp16_DP                         --base_batch_size 2                         --run_mode DP                         --fp_item fp16                         --keyword ips:                         --skip_steps 4                         --device_num N1C1                         --speed_unit images/s                         --convergence_key loss: 
[proxychains] DLL init: proxychains-ng 4.14
---device_num:- N1C1
---index_c:- 2
-----gpu_num: 1
Extract 429 records: separator=None; position=None
average ips of 429 steps, skip 0 step:
 Avg: 2.942 images/s
 FPS: 2.942 images/s
average ips of 429 steps, skip 4 steps, valid steps 383 :
 var: 0.009 
 Avg: 2.954 images/s
 Min: 2.693 images/s
 Max: 3.123 images/s
 diff_min_max: -13.742 %
 FPS: 2.954 images/s
 Loss: 0.822845
{"model_branch": "develop", "model_commit": "82968f5df92f1c0cb87c91fd3bf5b93c6d839867", "model_name": "mask_rcnn_r50_1x_coco_bs2_fp16_DP", "batch_size": 2, "fp_item": "fp16", "run_mode": "DP", "convergence_value": "0.822845", "convergence_key": "loss:", "ips": 2.954, "speed_unit": "images/s", "device_num": "N1C1", "model_run_time": "501", "frame_commit": "3bedec8a8ead5bc3c193650969ac180153802c95", "frame_version": "0.0.0"}

```

### nsight测试

接下来使用nsight进行profile：

简单的,你可以先用推理脚本进行完整的profile:

```Shell
nsys profile --stats=true -t cuda,nvtx -o paddle_report -f true python tools/infer.py -c configs/ppyolo/ppyolo_r50vd_dcn_1x_coco.yml -o use_gpu=true weights=https://paddledet.bj.bcebos.com/models/ppyolo_r50vd_dcn_1x_coco.pdparams --infer_img=demo/000000014439.jpg

```

之后我们可以对训练脚本修改部分nvtx然后看到更新后的timeline:

```Shell
nsys profile --stats=true -t cuda,nvtx -o train_report -f true python tools/train.py -c configs/mask_rcnn/mask_rcnn_r50_1x_coco.yml -o LearningRate.base_lr=0.0001 log_iter=1 use_gpu=True save_dir=./test_tipc/output/mask_rcnn_r50_1x_coco/benchmark_train/norm_train_gpus_0_autocast_fp32 epoch=1 pretrain_weights=https://paddledet.bj.bcebos.com/models/mask_rcnn_r50_1x_coco.pdparams TrainReader.batch_size=2 filename=mask_rcnn_r50_1x_coco TrainReader.shuffle=False --enable_ce=True
```

要可视化查看导出的结果，我们需要使用命令启动gui

```Shell
nsight-sys 
```

因为训练在trainer.train，所以我们可以对目标进行nvtx插桩：

```Python
    def train(self, validate=False):
        assert self.mode == 'train', "Model not in 'train' mode"
        Init_mark = False
        if validate:
            self.cfg['EvalDataset'] = self.cfg.EvalDataset = create(
                "EvalDataset")()

        model = self.model
        if self.cfg.get('to_static', False):
            model = apply_to_static(self.cfg, model)
        sync_bn = (getattr(self.cfg, 'norm_type', None) == 'sync_bn' and
                   (self.cfg.use_gpu or self.cfg.use_mlu) and self._nranks > 1)
        if sync_bn:
            model = paddle.nn.SyncBatchNorm.convert_sync_batchnorm(model)

        # enabel auto mixed precision mode
        if self.use_amp:
            scaler = paddle.amp.GradScaler(
                enable=self.cfg.use_gpu or self.cfg.use_npu or self.cfg.use_mlu,
                init_loss_scaling=self.cfg.get('init_loss_scaling', 1024))
        # get distributed model
        if self.cfg.get('fleet', False):
            model = fleet.distributed_model(model)
            self.optimizer = fleet.distributed_optimizer(self.optimizer)
        elif self._nranks > 1:
            find_unused_parameters = self.cfg[
                'find_unused_parameters'] if 'find_unused_parameters' in self.cfg else False
            model = paddle.DataParallel(
                model, find_unused_parameters=find_unused_parameters)

        self.status.update({
            'epoch_id': self.start_epoch,
            'step_id': 0,
            'steps_per_epoch': len(self.loader)
        })

        self.status['batch_time'] = stats.SmoothedValue(
            self.cfg.log_iter, fmt='{avg:.4f}')
        self.status['data_time'] = stats.SmoothedValue(
            self.cfg.log_iter, fmt='{avg:.4f}')
        self.status['training_staus'] = stats.TrainingStats(self.cfg.log_iter)

        if self.cfg.get('print_flops', False):
            flops_loader = create('{}Reader'.format(self.mode.capitalize()))(
                self.dataset, self.cfg.worker_num)
            self._flops(flops_loader)
        profiler_options = self.cfg.get('profiler_options', None)

        self._compose_callback.on_train_begin(self.status)

        use_fused_allreduce_gradients = self.cfg[
            'use_fused_allreduce_gradients'] if 'use_fused_allreduce_gradients' in self.cfg else False

        core.nvprof_start()
        core.nvprof_enable_record_event()
        for epoch_id in range(self.start_epoch, self.cfg.epoch):
            self.status['mode'] = 'train'
            self.status['epoch_id'] = epoch_id
            self._compose_callback.on_epoch_begin(self.status)
            self.loader.dataset.set_epoch(epoch_id)
            model.train()
            iter_tic = time.time()
            core.nvprof_nvtx_push("Data Loading")
            for step_id, data in enumerate(self.loader):
                core.nvprof_nvtx_pop()
                if step_id > 100:
                    import sys
                    sys.exit(0)
                core.nvprof_nvtx_push("Step id: {}".format(step_id))
                self.status['data_time'].update(time.time() - iter_tic)
                self.status['step_id'] = step_id
                profiler.add_profiler_step(profiler_options)
                self._compose_callback.on_step_begin(self.status)
                data['epoch_id'] = epoch_id
                if self.cfg.get('to_static',
                                False) and 'image_file' in data.keys():
                    data.pop('image_file')

                if self.use_amp:
                    if isinstance(
                            model, paddle.
                            DataParallel) and use_fused_allreduce_gradients:
                        with model.no_sync():
                            with paddle.amp.auto_cast(
                                    enable=self.cfg.use_gpu or
                                    self.cfg.use_npu or self.cfg.use_mlu,
                                    custom_white_list=self.custom_white_list,
                                    custom_black_list=self.custom_black_list,
                                    level=self.amp_level):
                                # model forward
                                core.nvprof_nvtx_push("Forward pass")
                                outputs = model(data)
                                loss = outputs['loss']
                                core.nvprof_nvtx_pop()
                            # model backward
                            core.nvprof_nvtx_push("Backward pass")
                            scaled_loss = scaler.scale(loss)
                            scaled_loss.backward()
                        core.nvprof_nvtx_push("Fuse gradients")
                        fused_allreduce_gradients(
                            list(model.parameters()), None)
                        core.nvprof_nvtx_pop()
                    else:
                        with paddle.amp.auto_cast(
                                enable=self.cfg.use_gpu or self.cfg.use_npu or
                                self.cfg.use_mlu,
                                custom_white_list=self.custom_white_list,
                                custom_black_list=self.custom_black_list,
                                level=self.amp_level):
                            # model forward
                            core.nvprof_nvtx_push("Forward pass")
                            outputs = model(data)
                            loss = outputs['loss']
                            core.nvprof_nvtx_pop()
                        # model backward
                        core.nvprof_nvtx_push("Backward pass")
                        scaled_loss = scaler.scale(loss)
                        scaled_loss.backward()
                        
                    # in dygraph mode, optimizer.minimize is equal to optimizer.step
                    scaler.minimize(self.optimizer, scaled_loss)
                else:
                    if isinstance(
                            model, paddle.
                            DataParallel) and use_fused_allreduce_gradients:
                        with model.no_sync():
                            # model forward
                            core.nvprof_nvtx_push("Forward pass")
                            outputs = model(data)
                            loss = outputs['loss']
                            core.nvprof_nvtx_pop()
                            # model backward
                            core.nvprof_nvtx_push("Backward pass")
                            loss.backward()
                        core.nvprof_nvtx_push("Fuse gradients")
                        fused_allreduce_gradients(
                            list(model.parameters()), None)
                        core.nvprof_nvtx_pop()
                    else:
                        # model forward
                        core.nvprof_nvtx_push("Forward pass")
                        outputs = model(data)
                        loss = outputs['loss']
                        core.nvprof_nvtx_pop()
                        # model backward
                        core.nvprof_nvtx_push("Backward pass")
                        loss.backward()
                    self.optimizer.step()
                    core.nvprof_nvtx_pop()
                curr_lr = self.optimizer.get_lr()
                self.lr.step()
                if self.cfg.get('unstructured_prune'):
                    self.pruner.step()
                self.optimizer.clear_grad()
                self.status['learning_rate'] = curr_lr

                if self._nranks < 2 or self._local_rank == 0:
                    self.status['training_staus'].update(outputs)

                self.status['batch_time'].update(time.time() - iter_tic)
                self._compose_callback.on_step_end(self.status)
                if self.use_ema:
                    self.ema.update()
                iter_tic = time.time()
                core.nvprof_nvtx_pop()
                core.nvprof_nvtx_push("Data Loading")

            core.nvprof_nvtx_pop()
            if self.cfg.get('unstructured_prune'):
                self.pruner.update_params()

            is_snapshot = (self._nranks < 2 or (self._local_rank == 0 or self.cfg.metric == "Pose3DEval")) \
                       and ((epoch_id + 1) % self.cfg.snapshot_epoch == 0 or epoch_id == self.end_epoch - 1)
            if is_snapshot and self.use_ema:
                # apply ema weight on model
                weight = copy.deepcopy(self.model.state_dict())
                self.model.set_dict(self.ema.apply())
                self.status['weight'] = weight

            self._compose_callback.on_epoch_end(self.status)

            if validate and is_snapshot:
                if not hasattr(self, '_eval_loader'):
                    # build evaluation dataset and loader
                    self._eval_dataset = self.cfg.EvalDataset
                    self._eval_batch_sampler = \
                        paddle.io.BatchSampler(
                            self._eval_dataset,
                            batch_size=self.cfg.EvalReader['batch_size'])
                    # If metric is VOC, need to be set collate_batch=False.
                    if self.cfg.metric == 'VOC':
                        self.cfg['EvalReader']['collate_batch'] = False
                    if self.cfg.metric == "Pose3DEval":
                        self._eval_loader = create('EvalReader')(
                            self._eval_dataset, self.cfg.worker_num)
                    else:
                        self._eval_loader = create('EvalReader')(
                            self._eval_dataset,
                            self.cfg.worker_num,
                            batch_sampler=self._eval_batch_sampler)
                # if validation in training is enabled, metrics should be re-init
                # Init_mark makes sure this code will only execute once
                if validate and Init_mark == False:
                    Init_mark = True
                    self._init_metrics(validate=validate)
                    self._reset_metrics()

                with paddle.no_grad():
                    self.status['save_best_model'] = True
                    self._eval_with_loader(self._eval_loader)

            if is_snapshot and self.use_ema:
                # reset original weight
                self.model.set_dict(weight)
                self.status.pop('weight')

        self._compose_callback.on_train_end(self.status)

```

修改后我们再去执行train.py的profile，就可以看到我们插的桩。

### 性能优化可以关注的点

有关精度溢出问题，可以切换fp16为bf16，但是要看架构是否适配，一般Ampere架构是支持的(默认安培架构都支持，比如30*系列，其他应该都不支持）40系列的 Ada架构也是支持的：（出自官方文档）Compared to Ampere, Ada delivers more than double the FP16, BF16, TF32, INT8, and INT4 Tensor TFLOPS, and also includes the Hopper FP8 Transformer Engine, delivering over 1.3 PetaFLOPS of tensor processing in the RTX 4090.

|CPU|Support|
|-|-|
|1st & 2nd Generation Intel® Xeon® Scalable Processors|no|
|3rd Generation Intel® Xeon® Scalable Processors (Cooper Lake)|yes|
|GPU|Support|
|Nvidia Volta (V100)|no|
|Nvidia Turing (T4)|no|
|Nvidia Ampere(A100)|yes|
|AMD Radeon RX6000|no|
|AMD Radeon Instinct|yes|
