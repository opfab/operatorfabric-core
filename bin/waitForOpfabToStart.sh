#!/bin/sh

# Copyright (c) 2021, RTE (http://www.rte-france.com)
# See AUTHORS.txt
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
# SPDX-License-Identifier: MPL-2.0
# This file is part of the OperatorFabric project.


waitService() { 
    while true; do
        result=`curl -vs $2 2>&1 | grep -i content-length | cut -c 2-3` 
        if [ -z $result ]
        then
            printf '%s' "."
        else 
            echo $(date) - "Opfab service $1 is started"
            break;
        fi  
        sleep 5;
    done
}
echo "Wait for opfab to start"
waitService businessconfig localhost:2100
waitService cards-publication localhost:2102/cards/userCard
waitService users localhost:2103
waitService cards-consultation localhost:2104
waitService keycloak localhost:89
