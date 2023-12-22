/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import CardsReminderControl from '../application/cardsReminderControl';
import CardsReminderOpfabServicesInterface from '../server-side/cardsReminderOpfabServicesInterface';
import ReminderService from '../application/reminderService';
import {RRuleReminderService} from '../application/rruleReminderService';
import RemindDatabaseService from '../server-side/remindDatabaseService';

export default class CardsReminderService {
    private cardsReminderControl: CardsReminderControl;
    private checkPeriodInSeconds: number;
    private active = false;
    private logger: any;

    constructor(
        opfabServicesInterface: CardsReminderOpfabServicesInterface,
        rruleReminderService: RRuleReminderService,
        reminderService: ReminderService,
        remindDatabaseService: RemindDatabaseService,
        checkPeriodInSeconds: number,
        logger: any
    ) {
        this.logger = logger;
        this.checkPeriodInSeconds = checkPeriodInSeconds;

        this.cardsReminderControl = new CardsReminderControl()
            .setOpfabServicesInterface(opfabServicesInterface)
            .setRruleReminderService(rruleReminderService)
            .setReminderService(reminderService)
            .setRemindDatabaseService(remindDatabaseService)
            .setLogger(logger);
        this.checkRegularly();
    }

    public start() {
        this.active = true;
    }

    public stop() {
        this.active = false;
    }

    public isActive(): boolean {
        return this.active;
    }

    public async reset() {
        const wasActive = this.active;
        this.stop();
        await this.cardsReminderControl.resetReminderDatabase();
        if (wasActive) this.start();
    }

    private checkRegularly() {
        if (this.active) {
            this.logger.debug('Check if some cards need to be remind');
            this.cardsReminderControl
                .checkCardsReminder()
                .catch((error) => this.logger.warn('error during periodic check' + error))
                .finally(() => setTimeout(() => this.checkRegularly(), this.checkPeriodInSeconds * 1000));
        }
        else setTimeout(() => this.checkRegularly(), this.checkPeriodInSeconds * 1000);
    }
}
