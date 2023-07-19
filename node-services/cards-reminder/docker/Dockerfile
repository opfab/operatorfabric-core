FROM node:20.4-alpine
RUN apk add --no-cache tzdata
WORKDIR /usr/app
RUN chown node:node /usr/app
USER node
RUN mkdir -p logs
COPY dockerBuild ./build
RUN mkdir -m777 config
COPY dockerConfig/default-docker.json ./config/default.json
COPY package.json ./
COPY startCardsReminder.sh ./
RUN npm config set https-proxy $https_proxy
RUN npm install --ignore-scripts
RUN npm config delete https-proxy
ENTRYPOINT ["./startCardsReminder.sh"]