FROM node:20.10.0-alpine
RUN apk add --no-cache tzdata
WORKDIR /usr/app
RUN chown node:node /usr/app
RUN mkdir -m777 /var/log/opfab
USER node
COPY dockerBuild ./build
RUN mkdir -m777 config
COPY dockerConfig/default-docker.yml ./config/base.yml
COPY package.json ./
COPY startCardsReminder.sh ./
RUN npm config set https-proxy $https_proxy
RUN npm install --ignore-scripts
RUN npm config delete https-proxy
ENTRYPOINT ["./startCardsReminder.sh"]