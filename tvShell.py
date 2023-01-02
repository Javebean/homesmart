#! /usr/bin env python3
#coding:utf-8
import subprocess 
cmds = [ "adb shell", "pm list package -3", "exit", ] 
# 第一个参数可以是字符串，也可以是字符串数组 
# stdin, stdout, stderr = subprocess.PIPE 表示为子进程创建新的管道 
# run和Popen差不多，run 方法调用方式返回 CompletedProcess 实例 
# shell=True 再unix下相当于args前添加/bin/sh -c windows下相当于cmd.exe /C 
# cmd的意思是：cmd.exe /C cmd 
# 在unix下，如果shell=False,第一个参数一般是字符串数组，若是字符串（必须是程序的路径）， 
# shell=True，第一个参数可以是字符串，因为如上面所讲，会自动在前面添加命令 
#在*nix下，当shell=True时，如果arg是个字符串，就使用shell来解释执行这个字符串。如果args是个列表，则第一项被视为命令， # 其余的都视为是给shell本身的参数。 
obj = subprocess.Popen('cmd', shell= True, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE) 
stdout_value, stderr_value = obj.communicate(("\n".join(cmds) + "\n").encode('utf-8')); 
# nfo = obj.communicate(input=None) 
#print(stdout_value.decode('gbk') ) 
# 转成字符串 # https://albertyzp.github.io/2019/09/06/Python+ADB%E5%AE%9E%E7%8E%B0%E5%AE%89%E5%8D%93%E8%AE%BE%E5%A4%87%E7%9A%84%E8%87%AA%E5%8A%A8%E5%8C%96/ 
result = stdout_value.decode('gbk') 
# print(result) 
arr = result.split('\r\n') 
#print(len(arr)) 
for line in arr: 
    if line.startswith("package:"): 
        print(line) 
        index1 = line.find('package:') 
        index2 = line.find('.apk') 
        index2 = index2+4 if index2 > -1 else index2 
        abPath = line[index1+8:index2] 
        print('提取的bao'+abPath) 
        cmdsz = [ 
            "adb shell", 
            "find -path *"+abPath+"*", 
            # -exec rm {} + "find -path **/Screenshot_20221222_142400_*launcher.jpg* -exec rm {} + 2>/dev/null", "exit",#这是是非常关键的，退出 
        ] 

        subojb = subprocess.Popen("cmd", shell= True, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE) 
        subinfo,stderr_value2 = subojb.communicate(("\n".join(cmdsz) + "\n").encode('utf-8')); 
        print(subinfo.decode('gbk')) 
        break 

        #find -path "*Screenshot_20221222_142400_*launcher.jpg*" 2>/dev/null

