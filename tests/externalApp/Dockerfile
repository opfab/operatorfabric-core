FROM azul/zulu-openjdk-alpine:21.0.10-jre@sha256:8cd90c54fa4ea0476f44dc10617b7489a86ccb5017f6f35a2ab89ff7b4248bab
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
