FROM node:24.18.0-alpine@sha256:a0b9bf06e4e6193cf7a0f58816cc935ff8c2a908f81e6f1a95432d679c54fbfd
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