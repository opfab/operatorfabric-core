#!/usr/bin/env bash

# Copyright (c) 2021, RTE (http://www.rte-france.com)
# See AUTHORS.txt
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
# SPDX-License-Identifier: MPL-2.0
# This file is part of the OperatorFabric project.

cd $OF_HOME

projectBuildPath="src/test/dummyModbusDevice/build"
projectPidFilePath="$projectBuildPath/PIDFILE"
echo "##########################################################"
    if [ -f "$projectPidFilePath" ]; then
      pid=$(<"$projectPidFilePath")
      echo "Stopping $1 (pid: $pid)"
      if ! kill $pid > /dev/null 2>&1; then
          echo "$1: could not send SIGTERM to process $pid" >&2
      fi
    else
      echo "'$projectPidFilePath' not found"
    fi
echo "##########################################################"