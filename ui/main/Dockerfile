FROM nginx:1.25.4-alpine@sha256:02d8d94023878cedf3e3acc55372932a9ba1478b6e2f3357786d916c2af743ba
VOLUME /tmp
RUN apk --no-cache add bash logrotate
# del unused lib for security reason 
RUN apk del nginx-module-image-filter
COPY build/distribution /usr/share/nginx/html/
COPY nginx/start-webui.sh /
COPY nginx/nginx-logrotate-conf /etc/logrotate.d/nginx
CMD ["/bin/sh", "/start-webui.sh"]
