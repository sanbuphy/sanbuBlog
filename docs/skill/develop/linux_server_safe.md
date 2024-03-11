---
title: linux服务器安全性维护
---

## 基本要求

拿到服务器后，我们需要注意以下事项：

- **修改密码从简单变复杂**
- 禁止向公网开放管理端口，若必须开放应限定管理IP地址并加强口令安全审计（口令长度不低于8位，由数字、大小写字母、特殊字符等至少两种以上组合构成）。
- 更改服务器ssh默认端口。
- 限制一些端口，不要让端口太多，仅仅有几个可以访问

## 简单工具

防火墙： <https://github.com/fail2ban/fail2ban>

网安威胁分析：<https://x.threatbook.com/>

## 好文参考推荐

记一次Linux挖矿病毒的清除   <https://cloud.tencent.com/developer/article/1523326>

**Linux应急响应篇** <https://forum.butian.net/share/821>

## Reference

<https://wiki.wgpsec.org/knowledge/hw/linux-emergency-response.html>

## 常用命令

### 查看登录ip

```python
cat /var/log/auth.log | grep Accepted
```

last查看当前最后连接登录到机器的ip

### **账号安全**

先查看基础用户信息文件(/etc/passwd，/etc/shadow，/etc/group)

```bash
1、查询特权用户特权用户(uid 为0)
awk -F: '$3==0{print $1}' /etc/passwd

2、查询可以远程登录的帐号信息
awk '/\$1|\$6/{print $1}' /etc/shadow

3、除root帐号外，其他帐号是否存在sudo权限。如非管理需要，普通帐号应删除sudo权限
more /etc/sudoers | grep -v "^#\|^$" | grep "ALL=(ALL)"

4、禁用或删除多余及可疑的帐号
usermod -L user    #禁用帐号，帐号无法登录，/etc/shadow第二栏为!开头
userdel -r user    #将删除user用户，并且将/home目录下的user目录一并删除

```

### **查看历史命令**

```bash
cat ~/.bash_history | less
```

### **检查开机启动项**

```bash
ll /etc/rc3.d/
ll /etc/init.d
```

### **检查定时任务**

```bash
ls -al /var/spool/cron/*
cat /etc/crontab
/etc/cron.d/*
/etc/cron.daily/*
/etc/cron.hourly/*
/etc/cron.monthly/*
/etc/cron.weekly/

#查看目录下所有文件
more /etc/cron.d/*
/etc/anacrontab
/var/spool/anacron/*

```

### **检查异常文件**

> 1、查看敏感目录，如/tmp目录下的文件，同时注意隐藏文件夹，以“..”为名的文件夹具有隐藏属性
>
>
> 2、针对可疑文件可以使用`stat`查看创建修改时间
>
> 3、发现WebShell、远控木马的创建时间
>
> **如何找出同一时间范围内创建的文件？**
>
> ```bash
> find ./ -iname "*" -atime 1 -type f
> #找出 ./ 下一天前访问过的文件
> 
> ```
>