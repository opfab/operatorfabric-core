FROM nginx:1.24.0-alpine
VOLUME /tmp
RUN apk add bash curl logrotate --no-cache
COPY distribution /usr/share/nginx/html/
COPY start-webui.sh /
COPY nginx-logrotate-conf /etc/logrotate.d/nginx
CMD ["/bin/sh", "/start-webui.sh"]
