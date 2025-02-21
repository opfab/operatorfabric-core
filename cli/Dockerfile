FROM node:22.14.0-alpine@sha256:9bef0ef1e268f60627da9ba7d7605e8831d5b56ad07487d24d1aa386336d1944
RUN apk add --no-cache bash bash-completion
WORKDIR /usr/app
RUN chown node:node /usr/app && mkdir /usr/app/opfab-cli
COPY src /usr/app/opfab-cli/
COPY entryPoint.sh /
COPY loadCompletion.sh /
RUN mkdir /opfab && chmod 777 /opfab
COPY bashrcForDocker /opfab/.bashrc
RUN chmod +x /entryPoint.sh
WORKDIR /usr/app/opfab-cli
# Use --ignore-scripts to improve security
RUN npm install -g --ignore-scripts

 #switch to non-root user
USER node 
CMD ["/entryPoint.sh"]