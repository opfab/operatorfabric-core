/* Copyright (c) 2022-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {ConfigService} from 'app/business/services/config.service';
import {RemoteLoggerService} from 'app/business/services/logs/remote-logger.service';
import {ConfigServerMock} from './configServer.mock';

export class RemoteLoggerServiceMock extends RemoteLoggerService {

    public constructor() {
        super(new ConfigService(new ConfigServerMock()),null);
    }

    public setRemoteLoggerActive(_active: boolean) {
        // mock
    }
    public postLog(_logLine: string) {
        // mock
    }

    public flush() {
        // mock
    }
}
