FROM azul/zulu-openjdk-alpine:17.0.13-jre@sha256:053468fd63845394201aac4c536f9d421c9bf3865e8838efd8b3b153509094b4
VOLUME /tmp
ARG JAR_FILE
RUN apk --no-cache add bash
# Add libc6-compat to support snappy compression for kafka
RUN apk add --no-cache libc6-compat
ENV SPRING_CONFIG_NAME classpath:/application.yml,common,application,cards-publication
ENV SPRING_CONFIG_LOCATION classpath:/application.yml,./config/,./external-config/
COPY build/docker/add-certificates.sh /add-certificates.sh
COPY build/docker/java-config-docker-entrypoint.sh /docker-entrypoint.sh
COPY build/libs/${JAR_FILE} app.jar
RUN mkdir -p /config
RUN mkdir -p /external-config
ENTRYPOINT ["/docker-entrypoint.sh"]
