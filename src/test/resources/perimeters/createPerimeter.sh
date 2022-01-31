#!/bin/bash

# Copyright (c) 2021, RTE (http://www.rte-france.com)
# See AUTHORS.txt
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
# SPDX-License-Identifier: MPL-2.0
# This file is part of the OperatorFabric project.

# This starts by moving to the directory where the script is located so the paths below still work even if the script
# is called from another folder
cd "$(dirname "${BASH_SOURCE[0]}")"

url=$2
if [ -z $url ] 
then
	url="http://localhost"
fi
if [ -z $1 ]
then
    echo "Usage : createPerimeter perimeter_name opfab_url"
else
    source ../getToken.sh "admin" $url
    echo "delete perimeter $1 on $url if existing "
    curl -X DELETE $url:2103/perimeters/$1 -H "Authorization:Bearer $token"
    echo ""
    echo "Create perimeter $1 on $url"
    curl -X POST $url:2103/perimeters -H "Content-type:application/json" -H "Authorization:Bearer $token" --data @$1.json
    echo ""
fi