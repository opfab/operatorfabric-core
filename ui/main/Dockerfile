FROM nginx:1.29.0-alpine@sha256:b2e814d28359e77bd0aa5fed1939620075e4ffa0eb20423cc557b375bd5c14ad
VOLUME /tmp
RUN apk --no-cache add bash logrotate \
    && apk del nginx-module-image-filter 
    # deleted unused lib for security reason 
COPY build/distribution/browser /usr/share/nginx/html/
COPY nginx/start-webui.sh /
COPY nginx/nginx-logrotate-conf /etc/logrotate.d/nginx
CMD ["/bin/sh", "/start-webui.sh"]
