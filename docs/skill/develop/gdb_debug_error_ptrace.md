---
title: gdb调试遇到ptrace Operation not permitted报错
---

如果你在docker容器中进行混合调试cpp python可能会遇到这个问题，因为你需要attach进程：

参考：<https://blog.csdn.net/Gamish/article/details/81632862>

从Ubuntu10.10开始，系统为安全考虑，默认阻止一个进程检查和修改另一个进程，除非前者是后者的父进程。

阻止操作由 ptrace_scope 实现，当 ptrace_scope = 1 时，gdb 在调试运行中的进程时，会产生如下报错：

Attaching to process xxx
Could not attach to process.  If your uid matches the uid of the target process,
check the setting of /proc/sys/kernel/yama/ptrace_scope, or try again as the root user.  
For more details, see /etc/sysctl.d/10-ptrace.conf
ptrace: Operation not permitted.

解决方案：

使 docker 容器具有 CAP_SYS_PTRACE ？
docker 使用 –privileged 和 –cap-add 、–cap-drop 来控制容器的权限，CAP有两个基准：

1.默认CAP集合:
[CAP_CHOWN CAP_DAC_OVERRIDE CAP_FSETID CAP_FOWNER CAP_MKNOD CAP_NET_RAW CAP_SETGID CAP_SETUID CAP_SETFCAP CAP_SETPCAP CAP_NET_BIND_SERVICE CAP_SYS_CHROOT CAP_KILL CAP_AUDIT_WRITE]

2.最大CAP集合：
[CAP_CHOWN CAP_DAC_OVERRIDE CAP_DAC_READ_SEARCH CAP_FOWNER CAP_FSETID CAP_KILL CAP_SETGID CAP_SETUID CAP_SETPCAP CAP_LINUX_IMMUTABLE CAP_NET_BIND_SERVICE CAP_NET_BROADCAST CAP_NET_ADMIN CAP_NET_RAW CAP_IPC_LOCK CAP_IPC_OWNER CAP_SYS_MODULE CAP_SYS_RAWIO CAP_SYS_CHROOT CAP_SYS_PTRACE CAP_SYS_PACCT CAP_SYS_ADMIN CAP_SYS_BOOT CAP_SYS_NICE CAP_SYS_RESOURCE CAP_SYS_TIME CAP_SYS_TTY_CONFIG CAP_MKNOD CAP_LEASE CAP_AUDIT_WRITE CAP_AUDIT_CONTROL CAP_SETFCAP CAP_MAC_OVERRIDE CAP_MAC_ADMIN CAP_SYSLOG CAP_WAKE_ALARM CAP_BLOCK_SUSPEND]

如果是–privileged启动，容器将获得最大的cap，如果不是，就需要用 –cap-add 、–cap-drop 来增加或删除。

获得 CAP_SYS_PTRACE 的命令：docker run -it --cap-add SYS_PTRACE imagesname /bin/bash

也就是说只需要加上 `-cap-add SYS_PTRACE` 作为启动命令就可以了，然后你就可以开始快乐的交互调试。
