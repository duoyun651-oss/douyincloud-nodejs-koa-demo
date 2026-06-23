FROM public-cn-beijing.cr.volces.com/public/base:node-16-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev --registry=https://registry.npmmirror.com

COPY SRC ./src

EXPOSE 8080

CMD ["npm", "start"]
