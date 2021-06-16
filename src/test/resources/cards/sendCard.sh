#!/bin/bash

# Copyright (c) 2021, RTE (http://www.rte-france.com)
# See AUTHORS.txt
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
# SPDX-License-Identifier: MPL-2.0
# This file is part of the OperatorFabric project.


url=$2
if [ -z $url ] 
then
	url="http://localhost"
fi
if [ -z $1 ]
then
    echo "Usage sendCard cardFile opfab_url"
else
    source ../getToken.sh "publisher_test" $url
    export current_date_in_milliseconds_from_epoch=$(($(date +%s%N)/1000000))
    export current_date_in_milliseconds_from_epoch_plus_3minutes=$(($(date +%s%N)/1000000 + 3*60*1000))
    export current_date_in_milliseconds_from_epoch_plus_1hours=$(($(date +%s%N)/1000000 + 60*60*1000))
    export current_date_in_milliseconds_from_epoch_plus_2hours=$(($(date +%s%N)/1000000 + 2*60*60*1000))
    export current_date_in_milliseconds_from_epoch_plus_4hours=$(($(date +%s%N)/1000000 + 4*60*60*1000))
    export current_date_in_milliseconds_from_epoch_plus_8hours=$(($(date +%s%N)/1000000 + 8*60*60*1000))
    export current_date_in_milliseconds_from_epoch_plus_12hours=$(($(date +%s%N)/1000000 + 12*60*60*1000))
    export current_date_in_milliseconds_from_epoch_plus_24hours=$(($(date +%s%N)/1000000 + 24*60*60*1000))
    export current_date_in_milliseconds_from_epoch_plus_48hours=$(($(date +%s%N)/1000000 + 48*60*60*1000))
    echo "send card $1 (url: $url)"
    curl -X POST $url:2102/cards -H "Authorization: Bearer $token" -H "Content-type:application/json" --data "$(envsubst <$1)"
fi