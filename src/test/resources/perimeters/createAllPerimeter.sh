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

for perimeter in *.json; do
    ./createPerimeter.sh  $perimeter $1
done

 ./addPerimeterToGroup.sh question Dispatcher
 ./addPerimeterToGroup.sh question Planner
 ./addPerimeterToGroup.sh defaultProcess Dispatcher
 ./addPerimeterToGroup.sh defaultProcess Planner
 ./addPerimeterToGroup.sh conferenceAndITIncidentExample Dispatcher
 ./addPerimeterToGroup.sh conferenceAndITIncidentExample Planner
 ./addPerimeterToGroup.sh conferenceAndITIncidentExample Supervisor
 ./addPerimeterToGroup.sh messageOrQuestionExample Dispatcher
 ./addPerimeterToGroup.sh messageOrQuestionExample Planner
 ./addPerimeterToGroup.sh messageOrQuestionExample Supervisor
 ./addPerimeterToGroup.sh taskExample Dispatcher
 ./addPerimeterToGroup.sh taskExample Planner
 ./addPerimeterToGroup.sh taskExample Supervisor
 ./addPerimeterToGroup.sh taskAdvancedExample Dispatcher
 ./addPerimeterToGroup.sh taskAdvancedExample Planner
 ./addPerimeterToGroup.sh taskAdvancedExample Supervisor
 ./addPerimeterToGroup.sh gridCooperation Dispatcher
 ./addPerimeterToGroup.sh gridCooperation Planner
 ./addPerimeterToGroup.sh gridCooperation Supervisor
 ./addPerimeterToGroup.sh cypress Dispatcher
 ./addPerimeterToGroup.sh cypress Planner
 ./addPerimeterToGroup.sh cypress Supervisor
 ./addPerimeterToGroup.sh questionReceiveOnly Supervisor
 ./addPerimeterToGroup.sh externalRecipient Dispatcher
 ./addPerimeterToGroup.sh supervisor Dispatcher
 
