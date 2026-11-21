FROM azul/zulu-openjdk-alpine:21.0.13.1-jre@sha256:ef5b08a60175d0e03db4fa885650657be0572d64d1e9e0efc05dd638f9a50feb
VOLUME /tmp
ARG JAR_FILE
COPY build/libs/${JAR_FILE} app.jar
ENTRYPOINT ["java", "-jar", "/app.jar"]