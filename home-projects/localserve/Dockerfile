# 使用 Aliyun 镜像来替换默认的 APK 源
FROM alpine AS builder
WORKDIR /app_localclip

# 替换 APK 源并安装 Node.js 和 npm
#RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories \
#    && apk add --update nodejs npm \
#    && npm config set registry https://registry.npmmirror.com
#RUN apk add --update nodejs npm
RUN apk add --update nodejs npm && npm config set registry https://registry.npmmirror.com
COPY ./package*.json ./
RUN npm install --production

FROM alpine:latest
WORKDIR /app_localclip

# 再次替换 APK 源并安装 Node.js 和 npm
#RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories \
#    && apk add --update nodejs npm
RUN apk add --update nodejs npm

COPY --from=builder /app_localclip/node_modules ./node_modules
COPY . .
CMD ["npm", "start"]