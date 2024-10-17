FROM azul/zulu-openjdk-alpine:17.0.13-jre@sha256:986bec7a9aaa39ff47f0fbe92ae990a0fa8e69a45832d5d4bc0c4c6f56353e1d
VOLUME /tmp
ARG JAR_FILE
COPY build/libs/${JAR_FILE} app.jar
ENTRYPOINT ["java", "-jar", "/app.jar"]