FROM azul/zulu-openjdk-alpine:17.0.10-jre@sha256:2dac0b864788dbfd161391de56db478bb016972283a3f86bdd31dfbb28939c36
VOLUME /tmp
ARG JAR_FILE
COPY build/libs/${JAR_FILE} app.jar
ENTRYPOINT ["java", "-jar", "/app.jar"]