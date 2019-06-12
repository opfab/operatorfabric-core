FROM openjdk:8-jdk-alpine
VOLUME /tmp
ARG JAR_FILE
ARG http_proxy
ARG https_proxy
ARG HTTP_PROXY_AUTH
ENV http_proxy=$http_proxy
ENV https_proxy=$https_proxy
ENV HTTP_PROXY_AUTH=$HTTP_PROXY_AUTH
COPY ${JAR_FILE} app.jar
COPY bootstrap-docker.yml /config/bootstrap.yml
COPY java-config-dependent-docker-entrypoint.sh /docker-entrypoint.sh
#RUN fetch http://ftp.acc.umu.se/mirror/alpinelinux.org/v3.5/main/x86_64/APKINDEX.tar.gz
RUN env
#RUN echo http://ftp.acc.umu.se/mirror/alpinelinux.org/v3.5/main > /etc/apk/repositories; \
#    echo http://ftp.acc.umu.se/mirror/alpinelinux.org/v3.5/community >> /etc/apk/repositories
RUN apk add bash curl --no-cache
ENV http_proxy=""
ENV https_proxy=""
ENV HTTP_PROXY_AUTH=""
RUN env
ENTRYPOINT ["/docker-entrypoint.sh"]