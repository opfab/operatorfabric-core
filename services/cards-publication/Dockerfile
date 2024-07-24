FROM azul/zulu-openjdk-alpine:17.0.12-jre@sha256:eec39c8b8325cf51fb5b781f4db551de6205e6a414e127c4b6c1aa59bb12d697
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
