FROM nginx:1.27.3-alpine@sha256:5acf10cd305853dc2271e3c818d342f3aeb3688b1256ab8f035fda04b91ed303
VOLUME /tmp
RUN apk --no-cache add bash logrotate \
    && apk del nginx-module-image-filter 
    # deleted unused lib for security reason 
COPY build/distribution /usr/share/nginx/html/
COPY nginx/start-webui.sh /
COPY nginx/nginx-logrotate-conf /etc/logrotate.d/nginx
CMD ["/bin/sh", "/start-webui.sh"]
