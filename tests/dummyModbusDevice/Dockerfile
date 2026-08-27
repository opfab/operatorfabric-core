FROM azul/zulu-openjdk-alpine:21.0.12.1-jre@sha256:e6ee0b1ce0eda3bcbe376e659b8cb11eec9c8a02bd23aec574671c242db63556
VOLUME /tmp
ARG JAR_FILE
COPY build/libs/${JAR_FILE} app.jar
ENTRYPOINT ["java", "-jar", "/app.jar"]