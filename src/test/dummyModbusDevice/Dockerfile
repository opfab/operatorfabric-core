FROM azul/zulu-openjdk-alpine:17.0.10-jre@sha256:82d2cb401b67cef2d956be0fc19e9f392b144891d224ff8bb16236609d943eaa
VOLUME /tmp
ARG JAR_FILE
COPY build/libs/${JAR_FILE} app.jar
ENTRYPOINT ["java", "-jar", "/app.jar"]