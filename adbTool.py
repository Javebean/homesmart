import shlex
import subprocess
import sys
import os
IP = '192.168.31.'
cmdList = {
    "con": "adb connect 192.168.31.215 & adb devices & adb root & adb remount",
    "dev": "adb devices & adb root & adb remount",
    "reboot": "adb reboot",
    "aks": "adb kill-server",
    "rem": "adb remount",
    "pmlist": "adb shell pm list packages -f",
    "lsa": "adb shell ls -l /system/app",
    "lsp": "adb shell ls -l /system/priv-app",
    "lsd": "adb shell ls -l /data/app",
    "rmlpe": "adb shell rm -rf ",
    "pull": "adb pull #0 #1",
    "push": "adb push # /system/app",
}
findPackages = []
autoLpe = ['kuaisou', 'com.yangqi', 'com.huawei']
# autoLpe = ['com.zte', 'com.dangbei', 'com.vixtel']
autoCommand = ['lpe', 'pull', 'rmlpe', 'push']


def pullApk(cmd, apkArr):
    # 把查出来的apk通过adb pull备份下
    arr1 = list(map(lambda x: cmd.replace("#0", x), apkArr))
    path = os.path.abspath("./apk_backup")
    return list(map(lambda x: x.replace("#1", path), arr1))


def doCmd(cmd):
    print('执行的命令：\r\n', cmd)
    obj = subprocess.Popen(cmd, shell=True, stdin=subprocess.PIPE,
                           stdout=subprocess.PIPE, stderr=subprocess.PIPE, universal_newlines=False)
    stdout_value, stderr_value = obj.communicate()
    result = stdout_value.decode('utf-8')  # gbk
    print('执行的命令结果：\r\n', result)
    return result


def doShellCmd(cmd):
    doCmd('adb root')
    print('执行的命令：\r\n', cmd)
    obj = subprocess.Popen('adb shell', shell=True, stdin=subprocess.PIPE,
                           stdout=subprocess.PIPE, stderr=subprocess.PIPE, universal_newlines=False)

    # value_is_string = isinstance(
    #     stdout_value, str if sys.version_info[0] >= 3 else basestring)

    stdout_value, stderr_value = obj.communicate(
        ("\n"+cmd+"\n exit \n").encode('utf-8'))
    # stdout_value, stderr_value = obj.communicate(cmd)
    result = stdout_value.decode('utf-8')  # gbk
    print('执行的命令结果：\r\n', result)
    return result


def checkAdbConnect():
    result = doCmd('adb devices')
    return "device" in result


def getApkPathList(result):
    lines = result.split('\r\r\n')
    str_list = list(map(getApkPath, lines))
    # 去除数组中的空元素 https://stackoverflow.com/a/3845453
    str_list = list(filter(None, str_list))
    return str_list


def getApkPath(line):
    if line.startswith('package:'):
        index = line.find('apk=')
        packageName = line[index+4:]
        if not packageName.startswith('com.android') and not packageName.startswith('android'):
            print('即将删除的非系统apk:',packageName)
            apkPath = line[8:index+3]
            return apkPath
        else:
            return None
    else:
        return None


def autoSimplify():
    print('请在原设置中开启有线网络、时间同步服务器、分辨率设置')
    userInput = input('确认继续？: \n')
    if userInput != 'y':
        sys.exit(1)
    ip4 = input('输入ip第四位？: \n')

    # step0 准备工作
    result = doCmd('adb connect 192.168.31.'+ip4)
    if not checkAdbConnect():
        sys.exit(1)

    result = doCmd('adb remount')
    # step1 用&&组装查询语句
    pmList = list(
        map(lambda x: 'adb shell pm list packages -f -e "'+x+'"', autoLpe))
    result = doCmd(' && '.join(pmList))

    # setp2 根据packages再解析出app路径
    appList = getApkPathList(result)

    # step3 先备份再删除
    # backUpPath = os.path.abspath("./apk_backup")
    # backUpCmdsArr = list(map(lambda x: 'adb pull '+x+' '+backUpPath, appList))
    # doCmd(' && '.join(backUpCmdsArr))

    # step4 删除解析出的app
    doCmd('adb shell rm -rf ' + (' '.join(appList)))

    # step5 安装到/system/app下
    appArr0 = os.listdir('./stmApp/')
    # files_path = [os.path.abspath('./stmApp/'+x) for x in appArr]
    appAbsPathArr = list(
        map(lambda x: os.path.abspath('./stmApp/'+x), appArr0))
    doCmd('adb push '+' '.join(appAbsPathArr)+' /system/app')


def autoSimplify2():
    ip4 = input('输入ip第四位？: \n')
    # step0 准备工作
    result = doCmd('adb connect 192.168.31.'+ip4)
    if not checkAdbConnect():
        sys.exit(1)

    result = doCmd('adb root & adb remount')


    if "remount succeeded" not in result:
        print('result:',result)
        userInput = input('确认继续？')
        #sys.exit(1)

    # step5 安装到/system/app下
    appArr0 = os.listdir('./stmApp/')
    # files_path = [os.path.abspath('./stmApp/'+x) for x in appArr]
    appAbsPathArr = list(
        map(lambda x: os.path.abspath('./stmApp/'+x), appArr0))
    doCmd('adb push '+' '.join(appAbsPathArr)+' /data/app')

    
    result = doCmd('adb root & adb remount')

    if "remount succeeded" not in result:
        print('result:',result)
        userInput = input('确认继续？')
        #sys.exit(1)

    # step1 查询系统所有安装包
    result = doCmd('adb shell pm list packages -f')

    # setp2 根据packages再解析出app路径
    appList = getApkPathList(result)
    
    # step4 删除解析出的app
    print(appList)
    if appList:
        #print('adb shell rm -rf ' + (' '.join(appList)))
        doCmd('adb shell rm -rf ' + (' '.join(appList)))



def rootDev():
    doCmd('adb remount')
    suPath = os.path.abspath("./SuperSU-v2.82-201705271822/armv7/su")
    suApkPath = os.path.abspath(
        "./SuperSU-v2.82-201705271822/common/Superuser.apk")
    doCmd('adb push '+suApkPath+' /system/app/')
    doCmd('adb push '+suPath+' /system/bin/')
    doCmd('adb push '+suPath+' /system/xbin/')
    doCmd('adb shell chmod 06755 /system/bin/su')
    doCmd('adb shell chmod 06755 /system/xbin/su')
    doCmd('adb shell /system/bin/su --install')
    doCmd('adb shell /system/bin/su --daemon&')


def installApp():
    appArr0 = os.listdir('./install-app/')
    appAbsPathArr = list(
        map(lambda x: 'adb install -r -d '+os.path.abspath('./install-app/'+x), appArr0))
    doCmd(' && '.join(appAbsPathArr))

    # doCmd('adb shell mount -o rw,remount /')
    doCmd('adb shell mkdir -p /sdcard/zzzapk/')
    pushCmdArr = list(
        map(lambda x: os.path.abspath('./install-app/'+x), appArr0))
    doCmd('adb push '+' '.join(pushCmdArr)+' /sdcard/zzzapk/')

# https://itlanyan.com/grep-invert-match-multiple-strings/


def rmSpecifyPathFile(cmd):
    doShellCmd('pm list packages | grep -v "com.android"')

    # print(cmd)
    # keyArr = cmd.split("#")
    # keyArr.pop(0)
    # for k in keyArr:
    #     print(k)
    #     findCmd = 'find /system/app /system/priv-app /data/app -path "*'+k+'*" -exec rm -rf {} +'
    #     doShellCmd((findCmd))


while True:
    userInput = input('请输入命令的key: \n')

    if userInput == 'q':
        break

    if userInput == 'auto':
        autoSimplify()
        continue
    if userInput == 'auto2':
        autoSimplify2()
        continue
    if userInput == 'root':
        rootDev()
        continue
    if userInput == 'install':
        installApp()
        continue
    if userInput.startswith('rm'):
        rmSpecifyPathFile(userInput)
        continue

    # 检查输入命令是否合法
    if userInput in cmdList:
        cmdItem = cmdList[userInput]
    else:
        print('输入有误，重新输入! 输入的命令:', userInput)
        continue

    # 命令自定义
    if userInput == "lpe":
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
            findPackages = getApkPathList(result)
        print('输出结果：\n', result)
