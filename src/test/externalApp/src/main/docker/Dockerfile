FROM azul/zulu-openjdk-alpine:17.0.8-jre
VOLUME /tmp
RUN env
ARG JAR_FILE
RUN apk add bash curl --no-cache
ENV SPRING_CONFIG_NAME common,application,external-app
ENV SPRING_CONFIG_LOCATION classpath:/application.yml,./config/,./external-config/
COPY add-certificates.sh /add-certificates.sh
COPY java-config-docker-entrypoint.sh /docker-entrypoint.sh
COPY ${JAR_FILE} app.jar
ENTRYPOINT ["/docker-entrypoint.sh"]