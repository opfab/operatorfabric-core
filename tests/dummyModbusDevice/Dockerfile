FROM azul/zulu-openjdk-alpine:21.0.10-jre@sha256:8cd90c54fa4ea0476f44dc10617b7489a86ccb5017f6f35a2ab89ff7b4248bab
VOLUME /tmp
ARG JAR_FILE
COPY build/libs/${JAR_FILE} app.jar
ENTRYPOINT ["java", "-jar", "/app.jar"]