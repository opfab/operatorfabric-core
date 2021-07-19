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

for d in *.json; do
    perimeter=${d:0:-5}  #remove last 5 character 
    ./createPerimeter.sh  $perimeter $1
done

 ./addPerimeterToGroup.sh  question Dispatcher $1
 ./addPerimeterToGroup.sh  question Planner $1
 ./addPerimeterToGroup.sh  defaultProcess Dispatcher $1
 ./addPerimeterToGroup.sh  defaultProcess Planner $1
 ./addPerimeterToGroup.sh  userCardExamples Dispatcher $1
 ./addPerimeterToGroup.sh  userCardExamples Planner $1
 ./addPerimeterToGroup.sh  userCardExamples Supervisor $1
 ./addPerimeterToGroup.sh  userCardExamples2 Dispatcher $1
 ./addPerimeterToGroup.sh  userCardExamples2 Planner $1
 ./addPerimeterToGroup.sh  userCardExamples2 Supervisor $1
 ./addPerimeterToGroup.sh  userCardExamples3 Dispatcher $1
 ./addPerimeterToGroup.sh  userCardExamples3 Planner $1
 ./addPerimeterToGroup.sh  userCardExamples3 Supervisor $1
 ./addPerimeterToGroup.sh  gridCooperation Dispatcher $1
 ./addPerimeterToGroup.sh  gridCooperation Planner $1
 ./addPerimeterToGroup.sh  gridCooperation Supervisor $1
 ./addPerimeterToGroup.sh  cypress Dispatcher $1
 ./addPerimeterToGroup.sh  cypress Planner $1
 ./addPerimeterToGroup.sh  questionReceiveOnly Supervisor $1