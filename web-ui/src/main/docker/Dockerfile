FROM nginx:1.25.2-alpine
VOLUME /tmp
RUN apk add bash curl logrotate --no-cache
# del unused lib for security reason 
RUN apk del nginx-module-image-filter
COPY distribution /usr/share/nginx/html/
COPY start-webui.sh /
COPY nginx-logrotate-conf /etc/logrotate.d/nginx
CMD ["/bin/sh", "/start-webui.sh"]
