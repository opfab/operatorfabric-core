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
    echo "Usage : loadBundle bundle_name opfab_url"
else
	echo "Will load bundle $1 on $url"
	(
	cd $1
	tar -czf $1.tar.gz ./*
	mv $1.tar.gz ../
	cd ..
	source ../getToken.sh "admin" $url
	curl -s -X POST "$url:2100/businessconfig/processes" -H  "accept: application/json" -H  "Content-Type: multipart/form-data" -H "Authorization:Bearer $token" -F "file=@$1.tar.gz;type=application/gzip"
	echo ""
	rm $1.tar.gz
	)
fi


