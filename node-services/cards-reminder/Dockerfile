FROM node:20.14.0-alpine@sha256:66c7d989b6dabba6b4305b88f40912679aebd9f387a5b16ffa76dfb9ae90b060
RUN apk add --no-cache tzdata
WORKDIR /usr/app
RUN chown node:node /usr/app
RUN mkdir -m777 /var/log/opfab
USER node
COPY build ./build
RUN mkdir -m777 config
COPY config/default-docker.yml ./config/base.yml
COPY package.json ./
COPY package-lock.json ./
COPY startCardsReminder.sh ./
COPY node_modules ./node_modules
ENTRYPOINT ["./startCardsReminder.sh"]