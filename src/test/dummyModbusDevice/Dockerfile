FROM azul/zulu-openjdk-alpine:17.0.13-jre@sha256:053468fd63845394201aac4c536f9d421c9bf3865e8838efd8b3b153509094b4
VOLUME /tmp
ARG JAR_FILE
COPY build/libs/${JAR_FILE} app.jar
ENTRYPOINT ["java", "-jar", "/app.jar"]