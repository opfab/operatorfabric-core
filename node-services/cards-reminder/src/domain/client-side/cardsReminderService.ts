/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import CardsReminderControl from '../application/cardsReminderControl';
import type CardsReminderOpfabServicesInterface from '../server-side/cardsReminderOpfabServicesInterface';
import type ReminderService from '../application/reminderService';
import type {RRuleReminderService} from '../application/rruleReminderService';
import type RemindDatabaseService from '../server-side/remindDatabaseService';

export default class CardsReminderService {
    private readonly cardsReminderControl: CardsReminderControl;
    private readonly checkPeriodInSeconds: number;
    private active = false;
    private readonly logger: any;

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

    public start(): void {
        this.active = true;
    }

    public stop(): void {
        this.active = false;
    }

    public isActive(): boolean {
        return this.active;
    }

    public async reset(): Promise<void> {
        const wasActive = this.active;
        this.stop();
        await this.cardsReminderControl.resetReminderDatabase();
        if (wasActive) this.start();
    }

    private checkRegularly(): void {
        if (this.active) {
            this.logger.debug('Check if some cards need to be remind');
            this.cardsReminderControl
                .checkCardsReminder()
                .catch((error) => this.logger.warn('error during periodic check' + error))
                .finally(() =>
                    setTimeout(() => {
                        this.checkRegularly();
                    }, this.checkPeriodInSeconds * 1000)
                );
        } else
            setTimeout(() => {
                this.checkRegularly();
            }, this.checkPeriodInSeconds * 1000);
    }
}
