FROM node:20.11.0-alpine
COPY package.json /
RUN npm install
COPY migration-opfab3.js /
COPY migration-opfab3-entrypoint.sh /
RUN mkdir -p /bundles
ENTRYPOINT ["/migration-opfab3-entrypoint.sh"]