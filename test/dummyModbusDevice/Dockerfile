FROM azul/zulu-openjdk-alpine:21.0.8-jre@sha256:d7a733bafd9167495ec6193a21f95afc80665812a9fd2e20695200e04a16e381
VOLUME /tmp
ARG JAR_FILE
COPY build/libs/${JAR_FILE} app.jar
ENTRYPOINT ["java", "-jar", "/app.jar"]