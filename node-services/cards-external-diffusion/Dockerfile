FROM node:22.20.0-alpine@sha256:cb3143549582cc5f74f26f0992cdef4a422b22128cb517f94173a5f910fa4ee7
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
COPY startCardsExternalDiffusion.sh ./
COPY node_modules ./node_modules
ENTRYPOINT ["./startCardsExternalDiffusion.sh"]