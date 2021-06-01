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
if [[ -z $url ]]
then
	url="http://localhost"
fi

if [ -z $1 ]
then
    echo "Usage: send6xN_TestCards.sh N with N being a number, the number of cards send will be 6 x N"

else	
(
cd cards
for i in `seq 1 $1`;
do

	./sendCard.sh defaultProcess/message.json $url
	./sendCard.sh defaultProcess/chart.json $url
	./sendCard.sh defaultProcess/process.json $url
	./sendCard.sh defaultProcess/question.json $url
	./sendCard.sh defaultProcess/chartLine.json $url
	./sendCard.sh defaultProcess/contingencies.json $url
done
)
fi