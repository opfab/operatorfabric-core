FROM node:20.15.1-alpine@sha256:34b7aa411056c85dbf71d240d26516949b3f72b318d796c26b57caaa1df5639a
WORKDIR /usr/app
RUN chown node:node /usr/app
RUN mkdir -m777 /var/log/opfab
USER node
COPY build ./build
RUN mkdir -m777 config
COPY config/default-docker.yml ./config/base.yml
COPY package.json ./
COPY package-lock.json ./
COPY startSupervisor.sh ./
COPY node_modules ./node_modules
ENTRYPOINT ["./startSupervisor.sh"]
