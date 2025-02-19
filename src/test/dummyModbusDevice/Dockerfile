FROM azul/zulu-openjdk-alpine:17.0.14-jre@sha256:887ed804e57455c5a1143bda2e0bbed423a56d0a7d30d231f25b4c838464dc6a
VOLUME /tmp
ARG JAR_FILE
COPY build/libs/${JAR_FILE} app.jar
ENTRYPOINT ["java", "-jar", "/app.jar"]