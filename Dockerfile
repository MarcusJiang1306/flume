FROM nginx:latest

COPY dist /usr/share/nginx/html/flume

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
