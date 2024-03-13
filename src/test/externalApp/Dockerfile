FROM azul/zulu-openjdk-alpine:17.0.10-jre@sha256:a87055ecb4be02f271e4fc13201129a01893bae5f1e541df6d30d9377851b644
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