FROM node:20.7-alpine
WORKDIR /usr/app
RUN chown node:node /usr/app
USER node
RUN mkdir -p logs
COPY dockerBuild ./build
RUN mkdir -m777 config
COPY dockerConfig/default-docker.yml ./config/base.yml
COPY package.json ./
COPY startSupervisor.sh ./
RUN npm config set https-proxy $https_proxy
RUN npm install --ignore-scripts
RUN npm config delete https-proxy
ENTRYPOINT ["./startSupervisor.sh"]
