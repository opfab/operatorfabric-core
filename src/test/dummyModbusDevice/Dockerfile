FROM azul/zulu-openjdk-alpine:21.0.7-jre@sha256:6ffe7528bb02cca947f791e59d3a4206ade9df5f584c0b62529b473dceae1f89
VOLUME /tmp
ARG JAR_FILE
COPY build/libs/${JAR_FILE} app.jar
ENTRYPOINT ["java", "-jar", "/app.jar"]