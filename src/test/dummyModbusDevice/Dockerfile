FROM azul/zulu-openjdk-alpine:17.0.12-jre@sha256:eec39c8b8325cf51fb5b781f4db551de6205e6a414e127c4b6c1aa59bb12d697
VOLUME /tmp
ARG JAR_FILE
COPY build/libs/${JAR_FILE} app.jar
ENTRYPOINT ["java", "-jar", "/app.jar"]