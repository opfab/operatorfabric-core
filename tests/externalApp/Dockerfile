FROM azul/zulu-openjdk-alpine:21.0.9-jre@sha256:2341a29169a5bde6a93e568534f68dc9c4aa6510fcf4f1c6aa3ff7dd2848bdf4
VOLUME /tmp
RUN env
ARG JAR_FILE
RUN apk add bash --no-cache
ENV SPRING_CONFIG_NAME=common,application,external-app
ENV SPRING_CONFIG_LOCATION=classpath:/application.yml,./config/,./external-config/
COPY build/docker/java-config-docker-entrypoint.sh /docker-entrypoint.sh
COPY build/libs/${JAR_FILE} app.jar
RUN mkdir -p /config
RUN mkdir -p /external-config
ENTRYPOINT ["/docker-entrypoint.sh"]
