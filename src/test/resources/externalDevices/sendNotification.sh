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
    echo "Usage sendNotification notificationFile opfab_url"
else
    source ../getToken.sh "operator2" $url
    echo "send notification file $1 (url: $url)"
    #curl -v -X POST $url:2105/notifications/ -H "Authorization: Bearer $token" -H "Content-type:application/json" --data "$(envsubst <$1)"
    curl -v -X POST $url:2002/externaldevices/notifications/ -H "Authorization: Bearer $token" -H "Content-type:application/json" --data "$(envsubst <$1)"
fi

