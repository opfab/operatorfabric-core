FROM azul/zulu-openjdk-alpine:17.0.13-jre@sha256:0cf64e4155800356f7543dd21bb8791aff1e5864daa52338e0d457a7d1d2f1b9
VOLUME /tmp
ARG JAR_FILE
COPY build/libs/${JAR_FILE} app.jar
ENTRYPOINT ["java", "-jar", "/app.jar"]