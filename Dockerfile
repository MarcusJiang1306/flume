FROM node:20-alpine

WORKDIR /app

# 复制服务器文件和静态资源
COPY server.js ./
COPY dist ./dist

EXPOSE 8101

CMD ["node", "server.js"]
