FROM nginx:1.27.1-alpine@sha256:c04c18adc2a407740a397c8407c011fc6c90026a9b65cceddef7ae5484360158
VOLUME /tmp
RUN apk --no-cache add bash logrotate
# del unused lib for security reason 
RUN apk del nginx-module-image-filter
COPY build/distribution /usr/share/nginx/html/
COPY nginx/start-webui.sh /
COPY nginx/nginx-logrotate-conf /etc/logrotate.d/nginx
CMD ["/bin/sh", "/start-webui.sh"]
