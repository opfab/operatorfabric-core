FROM node:24.14.0-alpine@sha256:7fddd9ddeae8196abf4a3ef2de34e11f7b1a722119f91f28ddf1e99dcafdf114
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