#!/bin/bash

# Copyright (c) 2021-2024, RTE (http://www.rte-france.com)
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
if [[ -z $url ]]
then
	url="http://localhost"
fi

port=$3
if [[ -z $port ]]
then
	port=2002
fi


if [[ -z $1 ]]
then
    echo "Usage : createPerimeter perimeter_name opfab_url opfab_port"
else
    opfab login $url $port admin test
    perimeterIds=$(jq -r '.[].id' $1)
    for  perimeterId in $perimeterIds; do
    echo "delete perimeter $perimeterId on $url if existing "
    opfab perimeters delete $perimeterId
    done
    echo ""
    echo "Create perimeter $1 on $url"
    opfab perimeters create $1
    echo ""
fi