#!/bin/bash

# Copyright (c) 2025, RTE (http://www.rte-france.com)
# See AUTHORS.txt
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
# SPDX-License-Identifier: MPL-2.0
# This file is part of the OperatorFabric project.

echo "Launching Roundcube Mail Client on port 8000"
docker run --name roundcubemail -e ROUNDCUBEMAIL_DEFAULT_PORT=3143 -e ROUNDCUBEMAIL_DEFAULT_HOST=172.17.0.1 -e ROUNDCUBEMAIL_SMTP_SERVER=172.17.0.1 -e ROUNDCUBEMAIL_SMTP_PORT=3025 -p 8000:80 -d roundcube/roundcubemail
