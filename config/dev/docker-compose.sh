#!/bin/bash

[[ -f .env-dev ]] && source .env-dev
if [ -z "${MY_DOCKER_HOST}" ]; then
  MY_DOCKER_HOST=172.17.0.1
fi
sed "s/\${MY_DOCKER_HOST}/$MY_DOCKER_HOST/g" ./ngnix.conf.template > ./.ngnix.conf
docker-compose up -d
