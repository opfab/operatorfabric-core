FROM node:20.14.0-alpine@sha256:66c7d989b6dabba6b4305b88f40912679aebd9f387a5b16ffa76dfb9ae90b060
WORKDIR /usr/app
RUN chown node:node /usr/app
RUN mkdir ./opfab-cli
COPY src ./opfab-cli/
COPY entryPoint.sh /
RUN chmod +x /entryPoint.sh
WORKDIR ./opfab-cli
# Use --ignore-scripts to improve security
RUN npm install -g --ignore-scripts
RUN mkdir /opfab
RUN chmod 777 /opfab
 #switch to non-root user
USER node 
CMD ["/entryPoint.sh"]