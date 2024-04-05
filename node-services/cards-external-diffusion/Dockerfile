FROM node:20.12.1-alpine@sha256:d21256de67597675524c5f75c72bc483ef5c10dc3b035f0459fd10de3e82b3c9
WORKDIR /usr/app
RUN chown node:node /usr/app
RUN mkdir -m777 /var/log/opfab
USER node
COPY build ./build
RUN mkdir -m777 config
COPY config/default-docker.yml ./config/base.yml
COPY package.json ./
COPY package-lock.json ./
COPY startCardsExternalDiffusion.sh ./
COPY node_modules ./node_modules
ENTRYPOINT ["./startCardsExternalDiffusion.sh"]