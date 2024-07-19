#!/bin/bash

# Copyright (c) 2021-2024, RTE (http://www.rte-france.com)
# See AUTHORS.txt
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
# SPDX-License-Identifier: MPL-2.0
# This file is part of the OperatorFabric project.


opfab perimeters create *.json
opfab perimeters addtogroup question Dispatcher
opfab perimeters addtogroup question Planner
opfab perimeters addtogroup defaultProcess Dispatcher
opfab perimeters addtogroup defaultProcess Planner
opfab perimeters addtogroup conferenceAndITIncidentExample Dispatcher
opfab perimeters addtogroup conferenceAndITIncidentExample Planner
opfab perimeters addtogroup conferenceAndITIncidentExample Supervisor
opfab perimeters addtogroup messageOrQuestionExample Dispatcher
opfab perimeters addtogroup messageOrQuestionExample Planner
opfab perimeters addtogroup messageOrQuestionExample Supervisor
opfab perimeters addtogroup taskExample Dispatcher
opfab perimeters addtogroup taskExample Planner
opfab perimeters addtogroup taskExample Supervisor
opfab perimeters addtogroup taskAdvancedExample Dispatcher
opfab perimeters addtogroup taskAdvancedExample Planner
opfab perimeters addtogroup taskAdvancedExample Supervisor
opfab perimeters addtogroup gridCooperation Dispatcher
opfab perimeters addtogroup gridCooperation Planner
opfab perimeters addtogroup gridCooperation Supervisor
opfab perimeters addtogroup cypress Dispatcher
opfab perimeters addtogroup cypress Planner
opfab perimeters addtogroup cypress Supervisor
opfab perimeters addtogroup questionReceiveOnly Supervisor
opfab perimeters addtogroup externalRecipient Dispatcher
opfab perimeters addtogroup supervisor Dispatcher
 
