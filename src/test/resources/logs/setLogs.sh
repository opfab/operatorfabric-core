#!/bin/bash

# Copyright (c) 2023, RTE (http://www.rte-france.com)
# See AUTHORS.txt
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
# SPDX-License-Identifier: MPL-2.0
# This file is part of the OperatorFabric project.

cd "$(dirname "${BASH_SOURCE[0]}")"
url=$4
if [ -z $url ] 
then
	url="http://localhost"
fi
if [ -z $3 ]
then
    echo "Usage : setLogs.sh host:port level user opfab_url"
else
	serviceAddress=$1
	level="{\"configuredLevel\": \"$2\"}"
	user=$3
	
	source ../getToken.sh $user $url
	

	curl -s -X POST "http://$serviceAddress/actuator/loggers/ROOT" -H "Authorization: Bearer $token" -H "Content-type:application/json" -d "${level}"
fi


