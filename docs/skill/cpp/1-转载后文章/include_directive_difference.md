---
title: What is the difference between \#include <filename> and \#include "filename"?
---

reference:<https://stackoverflow.com/questions/21593/what-is-the-difference-between-include-filename-and-include-filename>

## summary

headers whose names are enclosed in double-quotes ( "" ) shall be searched for `first in the directory of the file with the #include line, then in directories named in -I options, and last in the usual places.`

For headers whose names are enclosed in angle brackets ( "<>" ), the header shall be searched for `only in directories named in -I options and then in the usual places.`

What differs is the locations in which the preprocessor searches for the file to be included.

## include \<filename\>

The preprocessor searches in `an implementation-defined manner``, normally in directories pre-designated by the compiler/IDE. This method is normally used to include header files for the C standard library and other header files associated with the target platform

## include "filename"

The preprocessor also searches in an implementation-defined manner, `but one that is normally used to include programmer-defined header files and typically includes same directory as the file containing the directive` (unless an absolute path is given)

For GCC, a more complete description is available in the GCC [documentation on search paths](https://gcc.gnu.org/onlinedocs/cpp/Search-Path.html).

## posix standard

Some good answers here make references to the C standard but forgot the POSIX standard, especially the specific behavior of the c99 (e.g. C compiler) command.

According to The Open Group Base Specifications Issue 7,

-I directory

Change the algorithm for searching for headers whose names are not absolute pathnames to look in the directory named by the directory pathname before looking in the usual places. Thus, headers whose names are enclosed in double-quotes ( "" ) shall be searched for `first in the directory of the file with the #include line, then in directories named in -I options, and last in the usual places.` For headers whose names are enclosed in angle brackets ( "<>" ), the header shall be searched for `only in directories named in -I options and then in the usual places.` Directories named in -I options shall be searched in the order specified. Implementations shall support at least ten instances of this option in a single c99 command invocation.

So, in a POSIX compliant environment, with a POSIX compliant C compiler, #include "file.h" is likely going to search for ./file.h first, where . is the directory where is the file with the #include statement, while #include <file.h>, is likely going to search for /usr/include/file.h first, where /usr/include is your system defined usual places for headers (it's seems not defined by POSIX).

## -L -I 区别

在编译器命令行参数中，-L 和 -I 参数用于指定链接库和头文件的搜索路径，它们具有不同的作用：

-L（大写 L）参数：

功能：指定链接时库文件（.a, .so 等）的搜索目录。
用法：-L[path]，其中 [path] 是库文件所在的目录路径。
示例：gcc -L/usr/local/lib my_program.c -lmy_library。这表示在 /usr/local/lib 目录下查找名为 libmy_library.a 或 libmy_library.so 的库文件。
-I（大写 I）参数：

功能：指定编译时头文件（.h）的搜索路径。
用法：-I[path]，其中 [path] 是包含所需头文件的目录路径。
示例：gcc -I/home/user/my_project/includes my_program.c。这意味着在编译过程中，当遇到 #include "my_header.h" 之类的指令时，编译器会在 /home/user/my_project/includes 目录下查找 my_header.h 文件。
总结来说，-L 参数影响链接阶段对库文件的搜索，而 -I 参数影响编译阶段对头文件的搜索。
