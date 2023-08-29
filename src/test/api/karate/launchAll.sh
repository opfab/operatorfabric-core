#!/bin/sh

# Copyright (c) 2021-2023, RTE (http://www.rte-france.com)
# See AUTHORS.txt
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
# SPDX-License-Identifier: MPL-2.0
# This file is part of the OperatorFabric project.

rm -rf target
echo "Zip all bundles"
cd businessconfig/resources
./packageBundles.sh
cd ../..
../../../../gradlew karate --args="`cat adminTests.txt` `cat businessConfigTests.txt` `cat cardTests.txt` `cat userTests.txt` `cat externalDevicesTests.txt` `cat cardsExternalDiffusionTests.txt` `cat cardsReminderServiceTests.txt` `cat supervisorTests.txt`"
