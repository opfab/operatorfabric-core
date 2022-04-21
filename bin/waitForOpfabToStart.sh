#!/usr/bin/env bash

# Copyright (c) 2021, RTE (http://www.rte-france.com)
# See AUTHORS.txt
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
# SPDX-License-Identifier: MPL-2.0
# This file is part of the OperatorFabric project.

services=( "users" "cards-consultation" "cards-publication" "businessconfig")

function display_usage() {
	echo -e "\nThis script waits for the specified OpFab services to start, as well as Keycloak."
	echo -e "Usage:"
	echo -e "\twaitforOpfabToStart.sh [OPTIONS]\n"
	echo -e "options:"
	echo -e "\t-s, --services\t: list of comma separated services. Services for which to wait. Defaults to " $(join_by ","  "${services[@]}")
}


while [[ $# -gt 0 ]]
do
key="$1"
case $key in
    -s|--services)
    stringServices=$2
    services=(${stringServices//,/ })
    shift # past argument
    shift # past value
    ;;
    -h|--help)
    display_usage
    exit 0
    shift # past argument

    ;;
    *)    # unknown option
    command+=("$1") # save it in an array for later
    shift # past argument
    ;;
esac
done

waitService() {
    service=$1;
    if [[ " ${services[*]} " =~ " ${service} " || $service == "keycloak" ]];
    then
       echo "Waiting for $1"
       while true; do
         result=`curl -vs $2 2>&1 | grep -i content-length | cut -c 2-3`
         if [ -z $result ]
         then
             printf '%s' "."
         else
             echo $(date) - "$1 is started"
             break;
         fi
         sleep 5;
       done
    else
       echo "Not checking $1"
    fi


}
echo "Wait for opfab to start"
waitService businessconfig localhost:2100
waitService cards-publication localhost:2102/cards/userCard
waitService users localhost:2103
waitService cards-consultation localhost:2104
waitService external-devices localhost:2105
waitService keycloak localhost:89
