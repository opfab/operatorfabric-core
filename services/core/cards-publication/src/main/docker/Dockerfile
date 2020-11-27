FROM azul/zulu-openjdk-alpine:11-jre
VOLUME /tmp
ARG JAR_FILE
ARG http_proxy
ARG https_proxy
ARG HTTP_PROXY_AUTH
ENV http_proxy=$http_proxy
ENV https_proxy=$https_proxy
ENV HTTP_PROXY_AUTH=$HTTP_PROXY_AUTH
RUN env
RUN apk add bash curl --no-cache
ENV http_proxy=""
ENV https_proxy=""
ENV HTTP_PROXY_AUTH=""
RUN env
COPY add-certificates.sh /add-certificates.sh
COPY java-config-docker-entrypoint.sh /docker-entrypoint.sh
COPY common-docker.yml /config/common-docker.yml
COPY ${JAR_FILE} app.jar
COPY cards-publication-docker.yml /config/application-docker.yml
ENTRYPOINT ["/docker-entrypoint.sh"]
