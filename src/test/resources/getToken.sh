#!/bin/bash

# Copyright (c) 2021-2024, RTE (http://www.rte-france.com)
# See AUTHORS.txt
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
# SPDX-License-Identifier: MPL-2.0
# This file is part of the OperatorFabric project.

url=$1
if [[ -z $url ]]
then
	url="http://localhost"
fi

username=$2
if [[ -z $username ]]
then
	username="admin"
fi

password=$3
if [[ -z $password ]]
then
	password="test"
fi



getToken() {
	echo "Get token for user $username on $url"
	access_token_pattern='"access_token":"([^"]+)"'
	response=$(curl -v -s -X POST -d "username="$username"&password="$password"&grant_type=password" $url:2002/auth/token)
	if [[ $response =~ $access_token_pattern ]] ; then
		export token=${BASH_REMATCH[1]}
	fi
	#echo  token=$token
}

if [ -n "${token}" ]; then
	expire_date=`echo $token | jq -R 'split(".") | .[1] | @base64d | fromjson' | grep "exp" | cut -d ":" -f 2 | cut -d "," -f 1 | tr -d ' ' `

	now=`date +%s`
	if [ "$expire_date" -lt "$now" ]; then
	  getToken
	fi
else
    getToken
fi

