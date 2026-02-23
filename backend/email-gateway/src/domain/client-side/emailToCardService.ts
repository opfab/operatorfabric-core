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
import ConfigService from './configService';

export default class EmailToCardService {
    private readonly emailToCardApplication: EmailToCardApplication;
    private active = false;
    private secondsBetweenConnectionChecks = 10;

    constructor(
        servicesConfig: ConfigService,
        emailServer: EmailServerInterface,
        opfabInterface: OpfabServicesInterface,
        private readonly logger: any
    ) {
        this.emailToCardApplication = new EmailToCardApplication(emailServer, opfabInterface, logger);
        this.emailToCardApplication.setMailboxes(servicesConfig.getConfig().incomingEmails.mailboxes);
        this.secondsBetweenConnectionChecks = servicesConfig.getConfig().incomingEmails.secondsBetweenConnectionChecks;
        if (this.secondsBetweenConnectionChecks === undefined || this.secondsBetweenConnectionChecks === null) {
            this.logger.debug(
                'secondsBetweenConnectionChecks is not defined in configuration. Applying default value 10 seconds.'
            );
            this.secondsBetweenConnectionChecks = 10;
        } else if (this.secondsBetweenConnectionChecks <= 0) {
            this.logger.error(
                'Invalid secondsBetweenConnectionChecks: ' +
                    this.secondsBetweenConnectionChecks +
                    '. Must be positive. Applying default value 10 seconds.'
            );
            this.secondsBetweenConnectionChecks = 10;
        }
        this.checkMailBoxRegularly();
    }

    public setConfiguration(serviceConfig: ConfigDTO) {
        this.secondsBetweenConnectionChecks =
            serviceConfig?.incomingEmails?.secondsBetweenConnectionChecks ?? this.secondsBetweenConnectionChecks;
        this.emailToCardApplication.setMailboxes(serviceConfig?.incomingEmails?.mailboxes ?? []);
    }

    public start(): void {
        this.active = true;
    }

    public stop(): void {
        this.active = false;
    }

    public isActive(): boolean {
        return this.active;
    }

    private checkMailBoxRegularly(): void {
        if (this.active) {
            this.logger.info('checkMailBoxRegularly');
            this.emailToCardApplication.checkMailBoxes();
        }
        setTimeout(() => {
            this.checkMailBoxRegularly();
        }, this.secondsBetweenConnectionChecks * 1000);
    }
}
