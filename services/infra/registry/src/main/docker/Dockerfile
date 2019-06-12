FROM openjdk:8-jdk-alpine
VOLUME /tmp
ARG JAR_FILE
ARG http_proxy
ARG https_proxy
ARG HTTP_PROXY_AUTH
COPY ${JAR_FILE} app.jar
COPY bootstrap-docker.yml /config/bootstrap.yml
ENTRYPOINT ["java","-agentlib:jdwp=transport=dt_socket,address=5005,server=y,suspend=n","-Djava.security.egd=file:/dev/./urandom","-jar","/app.jar"]