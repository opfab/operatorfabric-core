#!/bin/bash

# Copyright (c) 2025, RTE (http://www.rte-france.com)
# See AUTHORS.txt
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
# SPDX-License-Identifier: MPL-2.0
# This file is part of the OperatorFabric project.

print_help() {
    echo "Usage: $0 [mode]"
    echo "Available modes:"
    echo "  dev   -   all service in docker with permissive CORS (Default value)"
    echo "  prod  -   all service in docker with strict CORS , not useable with ng serve"
    echo "  java  -   run the Java application directly, using docker for other services , permissive CORS"
    echo "  light -   run only the essential services in docker, without test modules (Kafka,Zookeeper,Modbus dummy devices and ext app) permissive CORS"
}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR" || exit 1

(

    MODE=${1:-dev}

    [[ -f .env-dev ]] && source .env-dev #used to set specific MY_DOCKER_HOST if needed

    # Docker host IP is set by default for linux configuration
    if [ -z "${MY_DOCKER_HOST}" ]; then
                MY_DOCKER_HOST=172.17.0.1
    fi


    cd ../config
    #create a directory to store the current configuration 
    # so that the docker container can run with the same permissions
    echo USER_ID="$(id -u)" > .env
    echo USER_GID="$(id -g)" >> .env
    cat .env


    # create directory for bundle storage if not existing
    mkdir -p businessconfig-storage

    # create directory for mongo dump if not existing
    mkdir -p mongodump

    cp web-ui/ui-config/web-ui-base.json web-ui/ui-config/web-ui.json
    cp services/cards-publication-base.yml services/cards-publication.yml
    case "$MODE" in
        prod)
            echo "Prod mode : Using strict cors for production mode"
            cp web-ui/nginx-prod.conf web-ui/nginx.conf
            docker compose up -d
            ;;
        dev)
            echo "Dev mode: Using permissive cors for development mode"
            sed "s/\${MY_DOCKER_HOST}/$MY_DOCKER_HOST/g" ./web-ui/nginx-dev.conf.template > ./web-ui/nginx.conf
            docker compose up -d
            ;;
        light)
            echo "Light mode : Using permissive cors for development mode and do not start all test tools"
            sed "s/\${MY_DOCKER_HOST}/$MY_DOCKER_HOST/g" ./web-ui/nginx-dev.conf.template > ./web-ui/nginx.conf
            # Use a specific configuration for cards-publication without Kafka
            cp services/cards-publication-nokafka.yml services/cards-publication.yml
            docker compose up -d cards-consultation cards-publication users businessconfig mongodb rabbitmq keycloak web-ui cards-external-diffusion cards-reminder supervisor mailhog
            ;;
        java)
            echo "Java mode : Starting Java application directly with permissive CORS"
            sed "s/\${MY_DOCKER_HOST}/$MY_DOCKER_HOST/g" ./web-ui/nginx-dev.conf.template > ./web-ui/nginx.conf
            docker compose -f docker-compose.yml up -d mongodb rabbitmq keycloak mailhog zookeeper kafka web-ui cards-external-diffusion cards-reminder supervisor ext-app dummy-modbus-device_1 dummy-modbus-device_2
            cd ../bin
            ./run_all.sh start
            ;;
        *)
            echo "Unknown mode: $MODE"
            print_help
            exit 1
            ;;
    esac
    cd ../bin
    ./waitForOpfabToStart.sh
)

