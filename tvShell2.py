#! /usr/bin env python3
# coding:utf-8
import subprocess

""""
PKGSTART
#package:/system/priv-app/DefaultContainerService.apk=com.android.defcontainer
#package:/system/app/ZTEvideoplayer.apk=com.zte.videoplayer
#package:/system/app/ZTEBrowser.apk=com.zte.browser
#package:/system/app/ZTENaAgent.apk=com.ztestb.netaccessagent
#package:/system/app/ZTEDlna.apk=com.ztestb.dlna
#package:/system/app/RemoteIME.apk=com.amlogic.inputmethod.remote
#package:/system/priv-app/Discovery.apk=com.google.tv.discovery
#package:/system/priv-app/ProxyHandler.apk=com.android.proxyhandler
#package:/system/app/HTMLViewer.apk=com.android.htmlviewer
#package:/system/app/Android.defaultSigned.apk=android.defaultsigned
#package:/system/priv-app/IpRemote.apk=com.google.tv.ipremote
#package:/system/app/SubTitle.apk=com.amlogic.SubTitleService
#package:/system/app/Bluetooth.apk=com.android.bluetooth
#package:/system/app/HomeMedia.apk=com.zte.homemedia
#package:/system/priv-app/InputDevices.apk=com.android.inputdevices
#package:/system/app/ZTEphotoplayer.apk=zte.player.photoplayer
#package:/system/app/ZTEMcspBase.apk=com.ztestb.basecomp
#package:/system/app/SilenceInstaller.apk=com.android.silenceinstaller
#package:/system/app/ZTEmusicplayer.apk=com.zte.musicplayer
#package:/system/app/ZTEDlnagwapt.apk=com.ztestb.dlnagwapt
#package:/system/priv-app/SharedStorageBackup.apk=com.android.sharedstoragebackup
#package:/system/priv-app/VpnDialogs.apk=com.android.vpndialogs
#package:/system/app/PacProcessor.apk=com.android.pacprocessor
#package:/system/priv-app/MediaProvider.apk=com.android.providers.media
#package:/system/app/CertInstaller.apk=com.android.certinstaller
#package:/data/app/com.zn.adb_settings-1.apk=com.zn.adb_settings
#package:/system/app/ZTEOSDService.apk=STB.OSD
#package:/system/app/ZTEJavaWatch.apk=com.ztestb.javawatch
#package:/system/framework/framework-res.apk=android
#package:/system/app/Settings.apk=com.android.settings
#package:/system/app/ZTESqm.apk=com.ztestb.sqm
#package:/system/priv-app/ExternalStorageProvider.apk=com.android.externalstorage
#package:/data/app/com.phonelink.developer-1.apk=com.phonelink.developer
#package:/system/app/BasicDreams.apk=com.android.dreams.basic
#package:/system/app/NetworkTest.apk=com.zte.testnetwork
#package:/system/app/VisualDiagnosis.apk=com.zte.visualdiagnosis
#package:/system/priv-app/SystemUI.apk=com.android.systemui
#package:/system/app/ajvm.apk=com.zte.ajvm
#package:/system/app/KeyChain.apk=com.android.keychain
#package:/system/app/PackageInstaller.apk=com.android.packageinstaller
#package:/system/app/ZTEPlayer.apk=com.zte.zteplayer
package:/system/app/dbzm_3.1.0.2_dangbei.apk=com.dangbei.tvlauncher
#package:/system/app/SubtitleService.apk=zteplayer.service
#package:/data/app/cn.vmatrices.settings-1.apk=cn.vmatrices.settings
#package:/system/app/DLNAComponent.apk=com.android.dlna
#package:/system/app/ZTENetmanager.apk=com.zte.netmanager
#package:/system/app/AppsListApi.apk=com.zte.newlauncher.appslistapi
#package:/system/app/ZTEFileBrowser.apk=com.fb.FileBrower
#package:/system/priv-app/WallpaperCropper.apk=com.android.wallpapercropper
#package:/system/priv-app/FusedLocation.apk=com.android.location.fused
#package:/system/priv-app/BackupRestoreConfirmation.apk=com.android.backupconfirm
#package:/data/app/com.android.providers.settings-1.apk=com.android.providers.settings
#package:/system/app/ZTEMainControl.apk=com.stbmc.maincontrol
#package:/system/priv-app/Shell.apk=com.android.shell
#package:/system/priv-app/DownloadProvider.apk=com.android.providers.downloads
#package:/system/app/Licauth.apk=com.licauth.android
package:/system/app/EVQA_vixtel_tjmobile_1.37.171208.apk=com.vixtel.netvista.ott
PKGEND
"""

cmds = [ "adb remount",  "exit", ] 
obj = subprocess.Popen('cmd', shell= True, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE) 
stdout_value, stderr_value = obj.communicate(("\n".join(cmds) + "\n").encode('utf-8')); 
print(stdout_value.decode('gbk') ) 
# 转成字符串 # https://albertyzp.github.io/2019/09/06/Python+ADB%E5%AE%9E%E7%8E%B0%E5%AE%89%E5%8D%93%E8%AE%BE%E5%A4%87%E7%9A%84%E8%87%AA%E5%8A%A8%E5%8C%96/ 


f = open(__file__, encoding='utf-8')
line = f.readline()
flag = False
while line:
    if line.find('PKGSTART') != -1:
        flag = True
        line = f.readline()
    if line.find('PKGEND') != -1:
        flag = False
        break
    if flag and line.startswith("package:") and line.find('com.android') == -1:
        index1 = line.find('package:')
        index2 = line.find('.apk')
        index2 = index2+4 if index2 > -1 else index2
        apkPath = line[index1+8:index2]
        print('提取的apk路径'+apkPath)
        cmdsz = [
            "adb shell",
            "rm -f "+apkPath,
            # -exec rm {} + "find -path **/Screenshot_20221222_142400_*launcher.jpg* -exec rm {} + 2>/dev/null",
            "exit",  # 这是是非常关键的，退出
        ]

        subojb = subprocess.Popen(
            "cmd", shell=True, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        subinfo, stderr_value2 = subojb.communicate(
            ("\n".join(cmdsz) + "\n").encode('utf-8'))
        print('结果：'+subinfo.decode('gbk'))
    line = f.readline()
f.close()
