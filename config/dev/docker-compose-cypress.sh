#!/bin/bash

[[ -f .env-dev ]] && source .env-dev
if [ -z "${MY_DOCKER_HOST}" ]; then
  MY_DOCKER_HOST=172.17.0.1
fi

# Generate dev configuration
sed "s/\${MY_DOCKER_HOST}/$MY_DOCKER_HOST/g" ./nginx.conf.template > ./nginx.conf
../cypress/generateUIConfigForCypress.sh

# Using an override file to launch docker-compose while mounting the cypress-specific ui configuration
docker-compose -f docker-compose.yml -f ../cypress/docker-compose.ui-config.override.yml up -d

