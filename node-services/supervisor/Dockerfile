FROM node:22.16.0-alpine@sha256:9f3ae04faa4d2188825803bf890792f33cc39033c9241fc6bb201149470436ca
WORKDIR /usr/app
RUN chown node:node /usr/app \
    && mkdir -m777 /var/log/opfab
USER node
COPY build ./build
RUN mkdir -m777 config
COPY config/default-docker.yml ./config/base.yml
COPY package.json ./
COPY package-lock.json ./
COPY startSupervisor.sh ./
COPY node_modules ./node_modules
ENTRYPOINT ["./startSupervisor.sh"]
