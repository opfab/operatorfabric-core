FROM node:19.2-alpine
WORKDIR /usr/app
RUN chown node:node /usr/app
USER node
RUN mkdir -p logs
COPY build ./build
RUN mkdir -m777 config
COPY config/default-docker.json ./config/default.json
COPY package.json ./
COPY startCardsExternalDiffusion.sh ./
RUN npm config set https-proxy $https_proxy
RUN npm install --ignore-scripts
RUN npm config delete https-proxy
ENTRYPOINT ["./startCardsExternalDiffusion.sh"]