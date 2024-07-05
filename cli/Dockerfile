FROM node:20.15.0-alpine@sha256:df01469346db2bf1cfc1f7261aeab86b2960efa840fe2bd46d83ff339f463665
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