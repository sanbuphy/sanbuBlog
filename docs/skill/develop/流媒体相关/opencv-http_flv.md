---
title: 使用Nginx进行http-flv流转推-2022
---

最近遇到要让rtmp在前端展示的问题，我们知道flash已经不再被支持了，现在支持的是http传输协议。

如果要浏览器前端展示除了异步直接展示的方法就是用 http-flv。

| | RTMP | HLS | HTTP-FLV |
|------|------|------|------|
| 全称 | Real Time Message Protocol | HTTP Living Streaming | RTMP over HTTP |
| 协议 | TCP长连接 | HTTP短连接 | HTTP长连接 |
| 原理 | 每个时刻的数据收到后立刻转发 | 集合一段时间的数据，生成ts切片文件(三片)，并更新m3u8索引 | 同RTMP，使用HTTP协议（80端口）|
| 延时 | 1-3秒 | 5-20秒(依切片情况) | 1-3秒 |
| Web支持 | H5中需要使用插件 | 支持H5 | H5中需要使用插件 |
| 其他 | 跨平台支持较差，需要Flash技术支持 | 播放时需要多次请求，对于网络质量要求高 | 需要Flash技术支持，不支持多音频流、多视频流，不便于seek（即拖进度条）|

## 一、安装http-flv版的nginx

参考我之前的文章[https://sanbuphy.github.io/p/opencv读取视频图像处理后推流rtmp/](https://sanbuphy.github.io/p/opencv读取视频图像处理后推流rtmp/)

可以进行基础的配置，唯一的差别就是安装的时候选取的包为：

`git clone https://github.com/winshining/nginx-http-flv-module.git`

也和我们之前的rtmp包一样放在同级目录，然后进入nginx：

 （注意，不需要带上rtmp的附加模块，因为httpflv模块包含了rtmp包的基础功能）

```Bash
./configure --add-module=../nginx-http-flv-module
make -j8
sudo make install
```

安装结束后用同样的方法点亮nginx的初始化

> 如果你已经安装了nginx，你只需要whereis nginx，然后rm -rf对应的文件夹即可。

## 二、修改nginx配置

按之前文章同样的方法用code或者其他方式进入 `/usr/local/nginx/conf/nginx.conf` ，按照如下规则修改：

```text
# 在server内的location /stat.xsl之下加入如下字样，同时别忘了把stat.xsl的root地址改成http-flv的
location /live{
    flv_live on; #打开 HTTP 播放 FLV 直播流功能
    chunked_transfer_encoding on; #支持 'Transfer-Encoding: chunked' 方式回复

    add_header 'Access-Control-Allow-Origin' '*'; #添加额外的 HTTP 头
    add_header 'Access-Control-Allow-Credentials' 'true'; #添加额外的 HTTP 头
}

# 在原来rtmp配置的地方加入如下字样
application http_flv{
  live on;
}

```

> 特别注意的是，每次修改完配置一定要记得`sudo /usr/local/nginx/sbin/nginx -s reload`

ps:这里有个坑就是我改了worker_processes后就不能运行了。。这个具体细节可以搜索，实际上比较复杂。

## 三、开始推流

按照前文同样的方式你可以直接推送成rtmp流，如果你想要推送成http-flv支持的格式则修改：

```Python
rtmp = 'rtmp://localhost:1935/mylive/test'
#把原来的rtmp推送地址修改为如下:
rtmp = 'rtmp://localhost:1935/http_flv/test'

```

然后再使用html模板进行直接查看（flv.js）

> 【此处需要修改`url: 'http://你的ip/live?port=1935&app=http_flv&stream=test',`为你的ip】（这个是给前端拉流的地址）

```HTML
<!DOCTYPE html>
 <html>
  
 <head>
     <meta content="text/html; charset=utf-8" http-equiv="Content-Type">
     <title>flv.js demo</title>
     <style>
         .mainContainer {
             display: block;
             width: 640px;
         }
  
         .urlInput {
             display: block;
             width: 100%;
             margin-top: 8px;
             margin-bottom: 8px;
         }
  
         .centeredVideo {
             display: block;
             width: 100%;
             height: 320px;
         }
  
         .controls {
             display: block;
             width: 100%;
             text-align: left;
         }
     </style>
 </head>
  
 <body>
     <div class="mainContainer">
         <video id="videoElement" class="centeredVideo" controls autoplay width="640" height="320">Your browser is too
             old which doesn't support HTML5 video.</video>
     </div>
     <br>
     <div class="controls">
         <button onclick="flv_start()">开始</button>
         <button onclick="flv_pause()">暂停</button>
         <button onclick="flv_destroy()">停止</button>
         <input style="width:100px" type="text" name="seekpoint" />
         <button onclick="flv_seekto()">跳转</button>
     </div>
     <script src="https://cdn.bootcdn.net/ajax/libs/flv.js/1.5.0/flv.min.js"></script>
     <script>
         var player = document.getElementById('videoElement');
         if (flvjs.isSupported()) {
             var flvPlayer = flvjs.createPlayer({
                 type: 'flv',
                 isLive: true,
                 enableWorker:true,
                 enableStashBuffer:false,
                 stashInitialSize:128,
                 url: 'http://你的ip/live?port=1935&app=http_flv&stream=test',
  
             });
             flvPlayer.attachMediaElement(videoElement);
             flvPlayer.load();
             flv_start();
         }
  
         function flv_start() {
             player.play();
         }
  
         function flv_pause() {
             player.pause();
         }
  
         function flv_destroy() {
             player.pause();
             player.unload();
             player.detachMediaElement();
             player.destroy();
             player = null;
         }
  
         function flv_seekto() {
             player.currentTime = parseFloat(document.getElementsByName('seekpoint')[0].value);
         }
     </script>
 </body>
  
 </html>
```

点击开始播放，此时你已经可以看到页面上呈现了！

这里还要注意一点，如果你修改了主服务的监听端口（比如80到8080），

你需要修改`'http://你的ip/live?port=1935&app=http_flv&stream=test'`

为`'http://你的ip:新端口/live?port=1935&app=http_flv&stream=test'`

切记切记

## Reference

rtmp、http-flv视频直播以及配合视频处理算法的实现

[https://zhuanlan.zhihu.com/p/375548523](https://zhuanlan.zhihu.com/p/375548523)

FFmpeg + nginx-http-flv-module + flv.js 实现视频流播放

[https://hasaik.com/posts/358f95d9.html](https://hasaik.com/posts/358f95d9.html)

不依赖flashrtsp流通过ffmpeg+nginx-http-flv转成rtmp以及http-flv流并通过flv.js在页面播放(附带所用的工具下载)

[https://www.361shipin.com/blog/1542511538894536704](https://www.361shipin.com/blog/1542511538894536704)
