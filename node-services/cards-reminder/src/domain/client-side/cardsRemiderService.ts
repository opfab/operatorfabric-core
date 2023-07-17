/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import CardsReminderControl from '../application/cardsReminderControl';
import OpfabServicesInterface from '../server-side/opfabServicesInterface';
import ReminderService from '../application/reminderService';
import {RRuleReminderService} from '../application/rruleReminderService';


export default class CardsReminderService {

    private cardsReminderControl: CardsReminderControl;
    private checkPeriodInSeconds: number;
    private active = false;
    private logger: any;


    constructor(opfabServicesInterface: OpfabServicesInterface, rruleReminderService: RRuleReminderService, reminderService: ReminderService, checkPeriodInSeconds: number, logger: any) {
        this.logger = logger;
        this.checkPeriodInSeconds = checkPeriodInSeconds;

        this.cardsReminderControl = new CardsReminderControl()
            .setOpfabServicesInterface(opfabServicesInterface)
            .setRruleReminderService(rruleReminderService)
            .setReminderService(reminderService);

        this.checkRegularly();
    }

    public start() {
        this.active = true;
        this.checkRegularly();
    }

    public stop() {
        this.active = false;
    }

    public reset() {
        const wasActive = this.active;
        this.stop();

        this.cardsReminderControl.resetReminderDatabase();

        if (wasActive) this.start();
    }


    private checkRegularly() {
        if (this.active) {
            this.logger.debug("checkRegularly");
            this.cardsReminderControl.checkCardsReminder();
            setTimeout(() => this.checkRegularly(), this.checkPeriodInSeconds * 1000);

        }
    }

}
