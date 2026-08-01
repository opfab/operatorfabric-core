FROM node:24.18.1-alpine@sha256:f70403e87646dc51b45295f4b8b70cdad0b63d2297c4c9899119b03f7af7a6b3
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