FROM registry.cn-hangzhou.aliyuncs.com/library/node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm config set registry https://registry.npmmirror.com && npm ci --omit=dev

COPY SRC ./src

EXPOSE 8080

CMD ["npm", "start"]
