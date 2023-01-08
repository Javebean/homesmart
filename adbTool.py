import shlex
import subprocess
import sys
import os

cmdList = {
    "con": "adb connect 192.168.31.215",
    "dev": "adb devices",
    "aks": "adb kill-server",
    "rem": "adb remount",
    "lp": "adb shell pm list packages",
    "lpe": "adb shell pm list packages -e",  # 搜出来的存到数组中等待删除
    "rmlpe": "adb shell rm -rf ",
    "pull": "adb pull #0 #1",
    "push": "adb push # /system/app",
}
findPackages = []

auto = 0  # 自动根据下面的命令链来执行
autoIndex = 0
autoCheck = 'dev'  # 自动执行前，先检查下是否连接
autoLpeIndex = 0
autoLpe = ['set', 'browser', 'netaccessagent', 'newlauncher']
autoCommand = ['lpe', 'pull', 'rmlpe', 'push']


def getApkPath(result):
    findPackages = result.split('\r\r\n')
    # 去除数组中的空元素 https://stackoverflow.com/a/3845453
    str_list = list(filter(None, findPackages))
    return list(map(dealPath, str_list))


def dealPath(package):
    # 处理每一行的packages 得到apk路径
    index1 = package.find('package:')
    index2 = package.find('.apk')
    index2 = index2+4 if index2 > -1 else index2
    path = package[index1+8:index2]
    return path


def pullApk(cmd, apkArr):
    # 把查出来的apk通过adb pull备份下
    arr1 = list(map(lambda x: cmd.replace("#0", x), apkArr))
    path = os.path.abspath("./apk_backup")
    return list(map(lambda x: x.replace("#1", path), arr1))


def doCmd(cmd):
    obj = subprocess.Popen(cmd, shell=True, stdin=subprocess.PIPE,
                           stdout=subprocess.PIPE, stderr=subprocess.PIPE, universal_newlines=False)
    stdout_value, stderr_value = obj.communicate()
    result = stdout_value.decode('utf-8')  # gbk
    return result


def checkAdbConnect():
    result = doCmd('adb devices')
    return "device" in result


# for x in autoLpe:
#     print(x)


while True:
    # 自动还是手动执行，自动执行需要提前自定义命令
    if auto == 1:
        if autoIndex < len(autoCommand):
            userInput = autoCommand[autoIndex]
            if userInput:
                # 先检查设备是否连接
                if checkAdbConnect():
                    autoIndex += 1
                else:
                    print('auto自动检查设备未连接')
                    break
            else:
                print('auto取到的命令为空,结束!')
                break
        else:
            print('auto数组越界,结束! autoIndex:', autoIndex,
                  ' 数组长度:', len(autoCommand))
            break
    else:
        userInput = input('请输入命令的key: \n')

    if userInput == 'off':
        break

    # 检查输入命令是否合法
    if userInput in cmdList:
        cmdItem = cmdList[userInput]
    else:
        print('输入有误，重新输入! 输入的命令:', userInput)
        continue

    # 命令自定义
    if userInput == "lpe":
        if auto == 1:
            cmdItem += ' "'+autoLpe[autoLpeIndex]+'"'
            autoLpeIndex += 1
        else:
            findStr = input("请输入搜索的字符串。。。")
            cmdItem += ' "'+findStr+'"'
    elif userInput == "rmlpe":
        cmdItem += " ".join(findPackages)
        print('危险！即将执行命令：', cmdItem)
        break
    elif userInput == "push":
        appArr0 = os.listdir('./stmApp/')
        # files_path = [os.path.abspath('./stmApp/'+x) for x in appArr]
        appArr1 = list(map(lambda x: os.path.abspath('./stmApp/'+x), appArr0))
        appArr2 = list(map(lambda x: cmdItem.replace("#", x), appArr1))

        cmdItem = " && ".join(appArr2)
        print(cmdItem)

        break
    elif userInput == "pull":
        arr = pullApk(cmdItem, findPackages)
        cmdItem = " && ".join(arr)
        print('备份apk开始', cmdItem)
        break

    print('用户输入序号:'+userInput+' 命令：'+cmdItem)

    # 总结：都写在一行，比如adb shell pm list pageckages 就不需要exit,但是如果先进入adb shell 在执行命令需要exit
    args = shlex.split(cmdItem)
    # stdin,stdout,stderr三个管道都打开，备用。
    # 指定encoding 或 errors 或者将 text(universal_newlines)=True，返回字符串否则返回byte，此时stdin必=subprocess.PIPE
    # 返回值用到了stdout,stderr,所以上面的Popen要打开两个管道，如果communicat要写入数据，Popen也必须打开stdin管道
    # 因此省事的做法：Popen三个管道都打开
    obj = subprocess.Popen(args, shell=True, stdin=subprocess.PIPE,
                           stdout=subprocess.PIPE, stderr=subprocess.PIPE, universal_newlines=False)

    # 1.在Popen("adb shell")后继续输入命令，需要exit
    # stdout_value, stderr_value = obj.communicate(("\n"+cmdItem+"\n exit \n").encode('utf-8'))
    # result = stdout_value.decode('gbk')

    # 2.在Popen(adb shell pm list pageckages)后，直接communicate等待结束，不需要exit
    stdout_value, stderr_value = obj.communicate()
    # print(type(stdout_value))

    # 3.在Popen(adb shell pm list pageckages)后,不用communicate直接读取，
    # 以上三种不知道哪种好
    # result = obj.stdout.read().decode('gbk')
    # print(result)

    # check stdout is str or byte
    value_is_string = isinstance(
        stdout_value, str if sys.version_info[0] >= 3 else basestring)
    if value_is_string:
        print(stdout_value)
    else:
        result = stdout_value.decode('utf-8')  # gbk
        if userInput == "lpe":
            findPackages = getApkPath(result)
        print('输出结果：\n', result)
