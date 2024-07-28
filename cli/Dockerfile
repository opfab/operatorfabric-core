FROM node:20.16.0-alpine@sha256:eb8101caae9ac02229bd64c024919fe3d4504ff7f329da79ca60a04db08cef52
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