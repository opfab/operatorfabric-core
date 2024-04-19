FROM nginx:1.25.5-alpine@sha256:7bd88800d8c18d4f73feeee25e04fcdbeecfc5e0a2b7254a90f4816bb67beadd
VOLUME /tmp
RUN apk --no-cache add bash logrotate
# del unused lib for security reason 
RUN apk del nginx-module-image-filter
COPY build/distribution /usr/share/nginx/html/
COPY nginx/start-webui.sh /
COPY nginx/nginx-logrotate-conf /etc/logrotate.d/nginx
CMD ["/bin/sh", "/start-webui.sh"]
