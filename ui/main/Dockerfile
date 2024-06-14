FROM nginx:1.27.0-alpine@sha256:69f8c2c72671490607f52122be2af27d4fc09657ff57e42045801aa93d2090f7
VOLUME /tmp
RUN apk --no-cache add bash logrotate
# del unused lib for security reason 
RUN apk del nginx-module-image-filter
COPY build/distribution /usr/share/nginx/html/
COPY nginx/start-webui.sh /
COPY nginx/nginx-logrotate-conf /etc/logrotate.d/nginx
CMD ["/bin/sh", "/start-webui.sh"]
