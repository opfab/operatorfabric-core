FROM azul/zulu-openjdk-alpine:17.0.4.1-jre
VOLUME /tmp
ARG JAR_FILE
RUN apk add bash curl --no-cache
ENV SPRING_CONFIG_NAME common,application,external-devices
ENV SPRING_PROFILES_ACTIVE docker
ENV SPRING_CONFIG_LOCATION ./config/,./external-config/
COPY add-certificates.sh /add-certificates.sh
COPY java-config-docker-entrypoint.sh /docker-entrypoint.sh
COPY common-docker.yml /config/common-docker.yml
COPY ${JAR_FILE} app.jar
COPY external-devices-docker.yml /config/application-docker.yml
RUN mkdir -p /external-config
ENTRYPOINT ["/docker-entrypoint.sh"]
