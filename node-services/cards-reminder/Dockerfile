FROM node:22.14.0-alpine@sha256:9bef0ef1e268f60627da9ba7d7605e8831d5b56ad07487d24d1aa386336d1944
RUN apk add --no-cache tzdata
WORKDIR /usr/app
RUN chown node:node /usr/app \
    && mkdir -m777 /var/log/opfab
USER node
COPY build ./build
RUN mkdir -m777 config
COPY config/default-docker.yml ./config/base.yml
COPY package.json ./
COPY package-lock.json ./
COPY startCardsReminder.sh ./
COPY node_modules ./node_modules
ENTRYPOINT ["./startCardsReminder.sh"]