import os
from PIL import Image
# 保存所有图片为.jpg格式并删除原文件
for filename in os.listdir():
    print(filename)
    if filename.endswith(('.png', '.jpeg', '.gif', '.bmp')):
        img = Image.open(filename).convert('RGB')
        new_filename = filename.split('.')[0] + '.jpg'
        img.save(new_filename, 'JPEG')
        img.close()
        os.remove(filename)
# 检测修改后jpg文件名是否含有空格，有则替换成_
for filename in os.listdir():
    if filename.endswith('.jpg') and ' ' in filename:
        new_filename = filename.replace(' ', '_')
        os.rename(filename, new_filename)

