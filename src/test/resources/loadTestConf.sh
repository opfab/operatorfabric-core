#!/bin/bash

# Copyright (c) 2022-2024, RTE (http://www.rte-france.com)
# See AUTHORS.txt
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
# SPDX-License-Identifier: MPL-2.0
# This file is part of the OperatorFabric project.

# This starts by moving to the directory where the script is located so the paths below still work even if the script
# is called from another folder
cd "$(dirname "${BASH_SOURCE[0]}")"

url=$1 
if [[ -z $url ]]
then
	url="http://localhost"
fi
(
	source ./getToken.sh $url
	cd bundles
	./deleteAllBundles.sh $url
	./loadAllBundles.sh
	cd ../processGroups
	opfab processgroups load processGroups.json
	cd ../perimeters
	./createAllPerimeter.sh
	cd ../processMonitoring
	opfab processmonitoring load processMonitoring.json
	cd ../realTimeScreens
	opfab realtimescreen load realTimeScreens.json
	cd ../businessData
	./loadAllBusinessData.sh
)
