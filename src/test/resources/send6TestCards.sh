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

url=$1 
if [[ -z $url ]]
then
	url="http://localhost"
fi
(
	cd cards
	./sendCard.sh defaultProcess/message.json $url
	./sendCard.sh defaultProcess/chart.json $url
	./sendCard.sh defaultProcess/process.json $url
	./sendCard.sh defaultProcess/question.json $url
	./sendCard.sh defaultProcess/chartLine.json $url
	./sendCard.sh defaultProcess/contingencies.json $url
)
