FROM azul/zulu-openjdk-alpine:21.0.9-jre@sha256:2341a29169a5bde6a93e568534f68dc9c4aa6510fcf4f1c6aa3ff7dd2848bdf4
VOLUME /tmp
ARG JAR_FILE
COPY build/libs/${JAR_FILE} app.jar
ENTRYPOINT ["java", "-jar", "/app.jar"]