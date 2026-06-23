FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY SRC ./src

EXPOSE 8080

CMD ["npm", "start"]
