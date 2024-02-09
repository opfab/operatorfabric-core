#!/bin/bash

# Copyright (c) 2024, RTE (http://www.rte-france.com)
# See AUTHORS.txt
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
# SPDX-License-Identifier: MPL-2.0
# This file is part of the OperatorFabric project.

cd "$(dirname "${BASH_SOURCE[0]}")"

password=$3
if [[ -z $password ]]
then
	password="test"
fi

url=$4
if [[ -z $url ]]
then
	url="http://localhost"
fi
if [[ -z $2 ]]
then
    echo "Usage : getLogsNodeService.sh host:port user password opfab_url"
else
	serviceAddress=$1
	user=$2
	
	source ../getToken.sh $url $user $password
	
	response=$( curl -s "http://$serviceAddress/logLevel" -H "Authorization: Bearer $token" -H "Content-type:application/json")
	echo $response
fi