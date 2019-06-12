FROM alpine:latest
VOLUME /tmp
ARG http_proxy
ARG https_proxy
ARG HTTP_PROXY_AUTH
ENV http_proxy=$http_proxy
ENV https_proxy=$https_proxy
ENV HTTP_PROXY_AUTH=$HTTP_PROXY_AUTH
COPY bash-config-dependent-docker-entrypoint.sh /docker-entrypoint.sh
COPY script.sh /script.sh
COPY push_card_loop.sh /push_card_loop.sh
RUN apk add bash curl --no-cache
ENV http_proxy=""
ENV https_proxy=""
ENV HTTP_PROXY_AUTH=""
RUN env
ENTRYPOINT ["/docker-entrypoint.sh"]