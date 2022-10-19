#!/usr/bin/env bash

# Copyright (c) 2021-2022, RTE (http://www.rte-france.com)
# See AUTHORS.txt
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
# SPDX-License-Identifier: MPL-2.0
# This file is part of the OperatorFabric project.


#Remove shell cursor and restore on exit
tput civis
function cleanup() {
    tput cnorm
}
trap cleanup EXIT
#End remove shell cursor 


services=( "users" "cards-consultation" "cards-publication" "businessconfig" "external-devices")
showWaitInProgress=0

function display_usage() {
	echo -e "\nThis script waits for the specified OpFab services to start, as well as Keycloak."
	echo -e "Usage:"
	echo -e "\twaitforOpfabToStart.sh [OPTIONS]\n"
	echo -e "options:"
    echo -e "\t-w : show wait in progress on the terminal"
	echo -e "\t-s, --services\t: list of comma separated services. Services for which to wait. Defaults values : " ${services[*]}
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
    -w)
    showWaitInProgress=1
    shift # past argument
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


printWaitInProgress() {
sleep 5 &
pid=$!

frames="/ | \\ -"
while kill -0 $pid 2>&1 > /dev/null;
do
    for frame in $frames;
    do
        printf "\rWaiting for $1 to be up $frame " 
        sleep 0.2
    done
done
}

waitService() {
    service=$1;
    if [[ " ${services[*]} " =~ " ${service} " || $service == "keycloak" ]];
    then
       while true; do
         result=`curl -vs $2 2>&1 | grep -i content-length | cut -c 2-3`
         if [ -z $result ]
         then
            if [ $showWaitInProgress -eq 1 ] 
            then 
                printWaitInProgress $1
            else
                sleep 5 
            fi

         else 
             printf "\r$(date) - $1 is up\n"
             break;
         fi
         #sleep 5;
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
