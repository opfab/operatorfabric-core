#!/bin/bash

[[ -f .env-dev ]] && source .env-dev
if [ -z "${MY_DOCKER_HOST}" ]; then
  MY_DOCKER_HOST=172.17.0.1
fi

# Generate dev configuration
sed "s/\${MY_DOCKER_HOST}/$MY_DOCKER_HOST/g" ./nginx.conf.template > ./nginx.conf
./generateUIConfigForDev.sh

docker-compose up -d
