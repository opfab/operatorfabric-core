/* Copyright (c) 2025-2026, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import ConfigDTO from './configDTO';
import EmailToCardApplication from '../application/emailToCardApplication';
import {EmailServerInterface} from '../server-side/emailServerInterface';
import OpfabServicesInterface from '../../common/server-side/opfabServicesInterface';

export default class EmailToCardService {
    private readonly emailToCardApplication: EmailToCardApplication;

    constructor(
        defaultConfig: any,
        configFilePath: string | null,
        emailServer: EmailServerInterface,
        opfabInterface: OpfabServicesInterface,
        private readonly logger: any
    ) {
        this.emailToCardApplication = new EmailToCardApplication(
            defaultConfig,
            configFilePath,
            emailServer,
            opfabInterface,
            logger
        );
    }

    public patch(update: object): ConfigDTO {
        return this.emailToCardApplication.patch(update);
    }

    public getEmailToCardConfig(): ConfigDTO {
        return this.emailToCardApplication.getEmailToCardConfig();
    }

    public start(): void {
        this.emailToCardApplication.start();
    }

    public stop(): void {
        this.emailToCardApplication.stop();
    }

    public isActive(): boolean {
        return this.emailToCardApplication.isActive();
    }
}
