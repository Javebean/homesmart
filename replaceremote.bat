:: ����windows,batch script����ʹ��ANSI,Ҳ����GBK�Ų�������


@ECHO OFF
::clears the screen
CLS

set /p ip="Please Enter your ip:"
echo ��ʼadb����192.168.31.%ip%

adb connect 192.168.31.%ip%
adb devices

echo �����offline���뿪��������ģʽ������������





ECHO 1. root and remount and adb shell
ECHO 2.show pm list
ECHO 3.system/etc
ECHO 4.Log off
ECHO 5.Switch User
ECHO.

GOTO CHOICE
:CHOICE
CHOICE /C 12345 /M "��ѡ��:"

:: ע�⣺���һ��Ҫ����
:: Note - list ERRORLEVELS in decreasing order
IF ERRORLEVEL 5 GOTO SwitchUser
IF ERRORLEVEL 4 GOTO Logoff
IF ERRORLEVEL 3 GOTO systemEtc
IF ERRORLEVEL 2 GOTO packageList
IF ERRORLEVEL 1 GOTO getRoot

:: goto the label
:getRoot
adb root && adb remount
GOTO CHOICE

:packageList
adb shell pm list packages
GOTO CHOICE

:systemEtc
adb shell cd /system/etc
GOTO CHOICE

:Logoff
ECHO Logoff (put your log off code here)
GOTO End

:SwitchUser
ECHO Switch User (put your switch user code here)
GOTO End

:End