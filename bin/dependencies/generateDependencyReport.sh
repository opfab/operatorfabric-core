#!/bin/bash

# Copyright (c) 2023-2025, RTE (http://www.rte-france.com)
# See AUTHORS.txt
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
# SPDX-License-Identifier: MPL-2.0
# This file is part of the OperatorFabric project.

current_git_branch=$(git rev-parse --abbrev-ref HEAD)
report_name=report-${current_git_branch}.txt
echo "Dependencies report is done on current git branch $current_git_branch"
echo "Build java report"
(
    echo "  Java report for backend"
    cd ../../
    ./gradlew backend:cards-publication:dependencies \
            backend:cards-consultation:dependencies \
            backend:businessconfig:dependencies \
            backend:external-devices:dependencies \
            backend:users:dependencies \
            backend:java-common:dependencies \
        >  bin/dependencies/${report_name}
    echo "  Java report for test app externalApp"
    cd tests/externalApp
    ../../gradlew dependencies >> ../../bin/dependencies/${report_name}
    echo "  Java report for test app dummyModbusDevice"
    cd ../dummyModbusDevice
    ../../gradlew dependencies >> ../../bin/dependencies/${report_name}
)

generateNpmReport() {
    project=$1;
    echo "  Npm report for $project"
    echo "Project : $project" >>  ${report_name}
    cat ../../${project}/package-lock.json >> ${report_name}
}

echo "Build npm report"
generateNpmReport backend/cards-reminder
generateNpmReport backend/cards-external-diffusion
generateNpmReport backend/supervisor
generateNpmReport frontend
echo "Report done in $report_name"
