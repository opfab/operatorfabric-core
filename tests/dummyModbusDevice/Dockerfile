FROM azul/zulu-openjdk-alpine:21.0.11-jre@sha256:589c6fb8ff775ed6208eb7bba9d5653bdb190a9773b5ef0324914cf053d8827e
VOLUME /tmp
ARG JAR_FILE
COPY build/libs/${JAR_FILE} app.jar
ENTRYPOINT ["java", "-jar", "/app.jar"]