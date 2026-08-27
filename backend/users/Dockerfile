FROM azul/zulu-openjdk-alpine:21.0.12.1-jre@sha256:e6ee0b1ce0eda3bcbe376e659b8cb11eec9c8a02bd23aec574671c242db63556
VOLUME /tmp
ARG JAR_FILE
RUN apk --no-cache add bash
ENV SPRING_CONFIG_NAME=common,application,users
ENV SPRING_CONFIG_LOCATION=classpath:/application.yml,./config/,./external-config/
COPY build/docker/add-certificates.sh /add-certificates.sh
COPY build/docker/java-config-docker-entrypoint.sh /docker-entrypoint.sh
COPY build/libs/${JAR_FILE} app.jar
RUN mkdir -p /config
RUN mkdir -p /external-config
ENTRYPOINT ["/docker-entrypoint.sh"]
