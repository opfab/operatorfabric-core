#!/bin/bash

# Copyright (c) 2021-2022, RTE (http://www.rte-france.com)
# See AUTHORS.txt
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
# SPDX-License-Identifier: MPL-2.0
# This file is part of the OperatorFabric project.

# This starts by moving to the directory where the script is located so the paths below still work even if the script
# is called from another folder
cd "$(dirname "${BASH_SOURCE[0]}")"

for d in *.json; do
    perimeter=${d:0:$((${#d} - 5))} #remove last 5 character
    ./createPerimeter.sh  $perimeter $1
done

 ./addPerimeterToGroup.sh question Dispatcher $1
 ./addPerimeterToGroup.sh question Planner $1
 ./addPerimeterToGroup.sh defaultProcess Dispatcher $1
 ./addPerimeterToGroup.sh defaultProcess Planner $1
 ./addPerimeterToGroup.sh conferenceAndITIncidentExample Dispatcher $1
 ./addPerimeterToGroup.sh conferenceAndITIncidentExample Planner $1
 ./addPerimeterToGroup.sh conferenceAndITIncidentExample Supervisor $1
 ./addPerimeterToGroup.sh messageOrQuestionExample Dispatcher $1
 ./addPerimeterToGroup.sh messageOrQuestionExample Planner $1
 ./addPerimeterToGroup.sh messageOrQuestionExample Supervisor $1
 ./addPerimeterToGroup.sh taskExample Dispatcher $1
 ./addPerimeterToGroup.sh taskExample Planner $1
 ./addPerimeterToGroup.sh taskExample Supervisor $1
 ./addPerimeterToGroup.sh taskAdvancedExample Dispatcher $1
 ./addPerimeterToGroup.sh taskAdvancedExample Planner $1
 ./addPerimeterToGroup.sh taskAdvancedExample Supervisor $1
 ./addPerimeterToGroup.sh gridCooperation Dispatcher $1
 ./addPerimeterToGroup.sh gridCooperation Planner $1
 ./addPerimeterToGroup.sh gridCooperation Supervisor $1
 ./addPerimeterToGroup.sh cypress Dispatcher $1
 ./addPerimeterToGroup.sh cypress Planner $1
 ./addPerimeterToGroup.sh cypress Supervisor $1
 ./addPerimeterToGroup.sh questionReceiveOnly Supervisor $1
 ./addPerimeterToGroup.sh externalRecipent Dispatcher $1
