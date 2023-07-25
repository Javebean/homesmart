@echo off
set "repoOwner=liu673cn" % 替换为 GitHub 用户名或组织名%
set "repoName=box"   % 替换为仓库名%
set "filePath=m.json"  % 文件在仓库中的路径%

curl -LJO "https://raw.githubusercontent.com/%repoOwner%/%repoName%/main/%filePath%"

:: 把下载好的文件覆盖到这两个文件
set "destinationPub=pub.json"
set "destinationPri=pri.json"

:: curl默认下载到脚本目录，如果filepath存在就是下载完成了
if exist "%filePath%" (
  :: /Y 参数用于在复制过程中自动确认覆盖。
  copy /Y "%filePath%" "%destinationPub%"
  copy /Y "%filePath%" "%destinationPri%"
  echo File downloaded successfully.
) else (
  echo Error downloading file.
)


set "repository_url=https://github.com/liu673cn/box.git"
set "folder_name=sub"

git clone --depth=1 --single-branch %repository_url% temp_repo
xcopy /E /Y temp_repo\%folder_name% .\%folder_name%\
rmdir /S /Q temp_repo

