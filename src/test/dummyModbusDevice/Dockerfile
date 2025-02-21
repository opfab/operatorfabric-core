FROM azul/zulu-openjdk-alpine:21.0.6-jre@sha256:cf24bfe32cb1b34d20d7cd256e9aaae677b576612c4cf293938980dfc1c4a3c1
VOLUME /tmp
ARG JAR_FILE
COPY build/libs/${JAR_FILE} app.jar
ENTRYPOINT ["java", "-jar", "/app.jar"]