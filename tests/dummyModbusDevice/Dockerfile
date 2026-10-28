FROM azul/zulu-openjdk-alpine:21.0.13-jre@sha256:bf5b3df8451da2f12910844aa6d3e5c466402bcb2b2b442cc299f63b635d9003
VOLUME /tmp
ARG JAR_FILE
COPY build/libs/${JAR_FILE} app.jar
ENTRYPOINT ["java", "-jar", "/app.jar"]