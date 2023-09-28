#!/bin/bash

# Copyright (c) 2021-2023, RTE (http://www.rte-france.com)
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

echo "Get token for user $username on $url"

access_token_pattern='"access_token":"([^"]+)"'
response=$(curl -s -X POST -d "username="$username"&password="$password"&grant_type=password&client_id=opfab-client" $url:2002/auth/token)
if [[ $response =~ $access_token_pattern ]] ; then
	export token=${BASH_REMATCH[1]}
fi
#echo  token=$token