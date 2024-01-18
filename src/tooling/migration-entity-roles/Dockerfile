FROM node:20.11.0-alpine
WORKDIR /usr/app
COPY ./ ./
RUN npm install 
COPY migration-entity-roles.js /
COPY migration-entity-roles-entrypoint.sh /
ENTRYPOINT ["/migration-entity-roles-entrypoint.sh"]