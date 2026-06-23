FROM public-cn-beijing.cr.volces.com/public/base:node-16-alpine

WORKDIR /opt/application

COPY package*.json ./

RUN npm install --omit=dev --registry=https://registry.npmmirror.com

COPY . .

RUN chmod +x run.sh

EXPOSE 8000

CMD ["sh", "run.sh"]
