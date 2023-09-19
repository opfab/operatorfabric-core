FROM nginx:1.25.2-alpine
VOLUME /tmp
RUN apk add bash curl logrotate --no-cache
# del unused lib for security reason 
RUN apk del nginx-module-image-filter
COPY distribution /usr/share/nginx/html/
COPY start-webui.sh /
COPY nginx-logrotate-conf /etc/logrotate.d/nginx

RUN mkdir /personal-conf
RUN mkdir /personal-conf/conf.d

RUN chown -R nginx:nginx /usr/share/nginx/html
RUN chown -R nginx:nginx /start-webui.sh
RUN chown -R nginx:nginx /personal-conf
RUN chown -R nginx:nginx /var/cache/nginx
RUN chown -R nginx:nginx /var/log/nginx/

USER nginx
CMD ["/bin/sh", "/start-webui.sh"]
