FROM azul/zulu-openjdk-alpine:17.0.11-jre@sha256:9bf1cff1512fe2bfaf21d518480d24d32e7b301d628e3a4268cd408e5b673e3f
VOLUME /tmp
ARG JAR_FILE
COPY build/libs/${JAR_FILE} app.jar
ENTRYPOINT ["java", "-jar", "/app.jar"]