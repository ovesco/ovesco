FROM node:current-slim

COPY . .

EXPOSE 8080

RUN npm i -g vuepress live-server

RUN npm run build

CMD ["live-server", "docs/.vuepress/dist"]
