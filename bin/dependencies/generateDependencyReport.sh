#!/bin/bash

# Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
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
    echo "  Java report for services"
    cd ../../
    ./gradlew services:cards-publication:dependencies \
            services:cards-consultation:dependencies \
            services:businessconfig:dependencies \
            services:external-devices:dependencies \
            services:users:dependencies \
            tools:generic:utilities:dependencies \
            tools:generic:test-utilities:dependencies \
            tools:spring:spring-mongo-utilities:dependencies \
            tools:spring:spring-oauth2-utilities:dependencies \
            tools:spring:spring-test-utilities:dependencies \
            tools:spring:spring-utilities:dependencies \
            tools:swagger-spring-generators:dependencies \
            tools:user-action-tracing:dependencies \
        >  bin/dependencies/${report_name}
    echo "  Java report for test app externalApp"
    cd src/test/externalApp
    ../../../gradlew dependencies >> ../../../bin/dependencies/${report_name}
    echo "  Java report for test app dummyModbusDevice"
    cd ../dummyModbusDevice
    ../../../gradlew dependencies >> ../../../bin/dependencies/${report_name}
)

generateNpmReport() {
    project=$1;
    echo "  Npm report for $project"
    echo "Project : $project" >>  ${report_name}
    cat ../../${project}/package-lock.json >> ${report_name}
}

echo "Build npm report"
generateNpmReport node-services/cards-reminder
generateNpmReport node-services/cards-external-diffusion
generateNpmReport node-services/supervisor
generateNpmReport ui/main
generateNpmReport src/tooling/migration-rrule-recurrence
generateNpmReport src/tooling/migration-opfab3
echo "Report done in $report_name"