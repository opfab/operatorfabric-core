/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import CardsDiffusionControl from '../application/cardsDiffusionControl';
import CardsDiffusionRateLimiter from '../application/cardsDiffusionRateLimiter';
import CardsExternalDiffusionDatabaseService from '../server-side/cardsExternaDiffusionDatabaseService';
import CardsExternalDiffusionOpfabServicesInterface from '../server-side/cardsExternalDiffusionOpfabServicesInterface';
import SendMailService from '../server-side/sendMailService';
import ConfigDTO from './configDTO';


export default class CardsExternalDiffusionService {

    private cardsDiffusionControl: CardsDiffusionControl;
    private checkPeriodInSeconds: number;
    private active = false;
    private logger: any;


    constructor(opfabServicesInterface: CardsExternalDiffusionOpfabServicesInterface,
            cardsExternalDiffusionDatabaseService: CardsExternalDiffusionDatabaseService, 
            mailService: SendMailService, serviceConfig: any, logger: any) {
        this.logger = logger;
        this.checkPeriodInSeconds = serviceConfig.checkPeriodInSeconds;
        this.cardsDiffusionControl = new CardsDiffusionControl()
            .setLogger(logger)
            .setOpfabServicesInterface(opfabServicesInterface)
            .setCardsExternalDiffusionDatabaseService(cardsExternalDiffusionDatabaseService)
            .setMailService(mailService)
            .setFrom(serviceConfig.mailFrom)
            .setSubjectPrefix(serviceConfig.subjectPrefix)
            .setBodyPrefix(serviceConfig.bodyPrefix)
            .setOpfabUrlInMailContent(serviceConfig.opfabUrlInMailContent)
            .setWindowInSecondsForCardSearch(serviceConfig.windowInSecondsForCardSearch)
            .setSecondsAfterPublicationToConsiderCardAsNotRead(serviceConfig.secondsAfterPublicationToConsiderCardAsNotRead);

        if (serviceConfig.activateCardsDiffusionRateLimiter) {
            const cardsDiffusionRateLimiter = new CardsDiffusionRateLimiter()
                .setLimitPeriodInSec(serviceConfig.sendRateLimitPeriodInSec)
                .setSendRateLimit(serviceConfig.sendRateLimit);
            this.cardsDiffusionControl.setCardsDiffusionRateLimiter(cardsDiffusionRateLimiter);
            this.cardsDiffusionControl.setActivateCardsDiffusionRateLimiter(true);
        }

        this.checkRegularly();
    }

    setConfiguration(serviceConfig: ConfigDTO) {
        if (serviceConfig.checkPeriodInSeconds)
            this.checkPeriodInSeconds = serviceConfig.checkPeriodInSeconds;
        
        this.cardsDiffusionControl.setConfiguration(serviceConfig);
        return this;
    }

    public start() {
        this.active = true;
    }

    public stop() {
        this.active = false;
    }

    public isActive() : boolean {
        return this.active;
    }

    private checkRegularly() {
        if (this.active) {
            this.logger.info('checkRegularly');
            this.cardsDiffusionControl
                .checkUnreadCards()
                .catch((error) => this.logger.error('error during periodic check' + error))
                .finally(() => setTimeout(() => this.checkRegularly(), this.checkPeriodInSeconds * 1000));
        }
        else setTimeout(() => this.checkRegularly(), this.checkPeriodInSeconds * 1000)
    }
}
