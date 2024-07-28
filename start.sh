# cd ./home-projects/localpage && pnpm run serve

#!/bin/bash

# 定义三个选项对应的命令
option1() {
  cd ./home-projects/localserve && pnpm run dev
}

option2() {
  cd ./home-projects/localpage && pnpm run serve
}

option3() {
  cd ./home-projects/localpage && pnpm run build-dest
}

# 无限循环直到输入有效的选项
while true; do
  echo "请选择一个选项："
  echo "1. 运行localServe"
  echo "2. 运行localPage"
  echo "3. 编译localPage"
  read -p "请输入选项 (1/2/3): " choice

  case $choice in
    1)
      option1
      break
      ;;
    2)
      option2
      break
      ;;
    3)
      option3
      break
      ;;
    *)
      echo "无效的选项，请重新输入。"
      ;;
  esac
done
