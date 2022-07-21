FROM nginx:1.23.0-alpine
VOLUME /tmp
ARG http_proxy
ARG https_proxy
ARG HTTP_PROXY_AUTH
ENV http_proxy=$http_proxy
ENV https_proxy=$https_proxy
ENV HTTP_PROXY_AUTH=$HTTP_PROXY_AUTH
RUN env
RUN apk add bash curl logrotate --no-cache
ENV http_proxy=""
ENV https_proxy=""
ENV HTTP_PROXY_AUTH=""
RUN env
COPY distribution /usr/share/nginx/html/
COPY start-webui.sh /
COPY nginx-logrotate-conf /etc/logrotate.d/nginx
CMD ["/bin/sh", "/start-webui.sh"]
