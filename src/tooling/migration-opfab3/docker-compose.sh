#!/bin/bash

# We check we have 5 parameters
if [ "$#" -ne 5 ]; then
  echo "Error : invalid number of arguments"
  echo "Usage: "
  echo "./docker-compose.sh <containerNameMongoDB> <portMongoDB> <loginMongoDB> <passwordMongoDB> <pathToBundlesDirectory>"
  exit 1
fi

BUNDLES_PATH=$5

# We check bundlesDirectory exists
if [ ! -d "$BUNDLES_PATH" ]; then
  echo "Error: $BUNDLES_PATH not found"
  exit 1
fi

echo BUNDLES_PATH=${BUNDLES_PATH} > .env

docker network create migration-opfab3-network
docker network connect migration-opfab3-network $1

docker-compose run migration-opfab3 $1 $2 $3 $4 $5

docker network disconnect migration-opfab3-network $1
docker network rm migration-opfab3-network