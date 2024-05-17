FROM alpine AS builder
WORKDIR /app_localclip
RUN apk add --update nodejs npm && npm config set registry https://registry.npmmirror.com
COPY ./package*.json ./
RUN npm install --production

FROM alpine:latest
WORKDIR /app_localclip
RUN apk add --update nodejs npm
COPY --from=builder /app_localclip/node_modules ./node_modules
COPY . .
CMD [ 'npm', 'start' ]