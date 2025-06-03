FROM nginx:1.28.0-alpine@sha256:aed99734248e851764f1f2146835ecad42b5f994081fa6631cc5d79240891ec9
VOLUME /tmp
RUN apk --no-cache add bash logrotate \
    && apk del nginx-module-image-filter 
    # deleted unused lib for security reason 
COPY build/distribution/browser /usr/share/nginx/html/
COPY nginx/start-webui.sh /
COPY nginx/nginx-logrotate-conf /etc/logrotate.d/nginx
CMD ["/bin/sh", "/start-webui.sh"]
