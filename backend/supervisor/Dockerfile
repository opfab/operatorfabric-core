FROM node:24.11.1-alpine@sha256:2867d550cf9d8bb50059a0fff528741f11a84d985c732e60e19e8e75c7239c43
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
