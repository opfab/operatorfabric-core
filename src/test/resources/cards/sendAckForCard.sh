#!/bin/bash

# Copyright (c) 2022-2024, RTE (http://www.rte-france.com)
# See AUTHORS.txt
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
# SPDX-License-Identifier: MPL-2.0
# This file is part of the OperatorFabric project.

acknowledgingEntities=$3
url=$4
if [[ -z $acknowledgingEntities ]]
then
	acknowledgingEntities="acknowledgingEntities.json"
fi
if [[ -z $url ]]
then
	url="http://localhost"
fi
if [[ -z $1 || -z $2 ]]
then
    echo "Usage : sendAckForCard user card_uid acknowledgingEntities opfab_url"
else
    source ../getToken.sh $url $1
    if [[ $acknowledgingEntities == *.json ]]; then
        curl -X POST $url:2102/cards/userAcknowledgement/$2 -H "Authorization: Bearer $token" -H "Content-type:application/json" --data "$(envsubst <$acknowledgingEntities)"
    else
        curl -X POST $url:2102/cards/userAcknowledgement/$2 -H "Authorization: Bearer $token" -H "Content-type:application/json" --data $acknowledgingEntities
    fi
fi