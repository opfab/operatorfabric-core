FROM node:20.11.0-alpine@sha256:2f46fd49c767554c089a5eb219115313b72748d8f62f5eccb58ef52bc36db4ad
WORKDIR /usr/app
COPY ./ ./
RUN npm install 
COPY migration-entity-roles.js /
COPY migration-entity-roles-entrypoint.sh /
ENTRYPOINT ["/migration-entity-roles-entrypoint.sh"]