#!/usr/bin/env bash

# Copyright (c) 2021, RTE (http://www.rte-france.com)
# See AUTHORS.txt
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
# SPDX-License-Identifier: MPL-2.0
# This file is part of the OperatorFabric project.

applicationOptions="--spring.profiles.active=dev --spring.config.location=classpath:/application.yml,file:${OF_HOME}/config/dev/ --spring.config.name=common,dummy-modbus-device"
projectBuildPath="src/test/dummyModbusDevice/build"
version=$OF_VERSION

cd $OF_HOME

mkdir -p $projectBuildPath/logs

java -Xss512k -XX:MaxRAM=512m \
      -jar $projectBuildPath/libs/dummyModbusDevice-$version.jar \
      $applicationOptions 2>&1 > $projectBuildPath/logs/$(date \+"%y-%m-%d").log &

echo $! > $projectBuildPath/PIDFILE

echo "Started with pid: $!"