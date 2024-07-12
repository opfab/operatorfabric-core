#!/bin/bash

# Copyright (c) 2021-2024, RTE (http://www.rte-france.com)
# See AUTHORS.txt
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
# SPDX-License-Identifier: MPL-2.0
# This file is part of the OperatorFabric project.

RANDOM=$$
url=$2
if [[ -z $url ]]
then
	url="http://localhost"
fi

port=$3
if [[ -z $port ]]
then
	port=2002
fi

processInstanceId=$RANDOM$RANDOM$RANDOM

cardCustomization="{\"processInstanceId\": \"${processInstanceId}\"}"


if [[ -z $1 ]]
then
    echo "Usage : sendCard cardFile opfab_url opfab_port"
else
    opfab login $url $port publisher_test test
    echo "send card $1 (url: $url)"
    
    opfab card send $1 "$cardCustomization"
fi