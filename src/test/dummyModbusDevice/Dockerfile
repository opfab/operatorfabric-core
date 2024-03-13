FROM azul/zulu-openjdk-alpine:17.0.10-jre@sha256:a87055ecb4be02f271e4fc13201129a01893bae5f1e541df6d30d9377851b644
VOLUME /tmp
ARG JAR_FILE
COPY build/libs/${JAR_FILE} app.jar
ENTRYPOINT ["java", "-jar", "/app.jar"]