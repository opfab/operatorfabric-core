FROM azul/zulu-openjdk-alpine:17.0.14-jre@sha256:887ed804e57455c5a1143bda2e0bbed423a56d0a7d30d231f25b4c838464dc6a
VOLUME /tmp
RUN env
ARG JAR_FILE
RUN apk add bash --no-cache
ENV SPRING_CONFIG_NAME common,application,external-app
ENV SPRING_CONFIG_LOCATION classpath:/application.yml,./config/,./external-config/
COPY build/docker/add-certificates.sh /add-certificates.sh
COPY build/docker/java-config-docker-entrypoint.sh /docker-entrypoint.sh
COPY build/libs/${JAR_FILE} app.jar
RUN mkdir -p /config
RUN mkdir -p /external-config
ENTRYPOINT ["/docker-entrypoint.sh"]