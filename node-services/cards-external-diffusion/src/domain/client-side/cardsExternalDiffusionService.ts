/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import CardsDiffusionRateLimiter from '../application/cardsDiffusionRateLimiter';
import CardsExternalDiffusionDatabaseService from '../server-side/cardsExternaDiffusionDatabaseService';
import BusinessConfigOpfabServicesInterface from '../server-side/BusinessConfigOpfabServicesInterface';
import CardsExternalDiffusionOpfabServicesInterface from '../server-side/cardsExternalDiffusionOpfabServicesInterface';
import SendMailService from '../server-side/sendMailService';
import ConfigDTO from './configDTO';
import DailyCardsDiffusionControl from '../application/dailyCardsDiffusionControl';
import RealTimeCardsDiffusionControl from '../application/realTimeCardsDiffusionControl';


const MILLISECONDS_IN_A_DAY = 24 * 60 * 60 * 1000;

export default class CardsExternalDiffusionService {
    private dailyCardsDiffusionControl: DailyCardsDiffusionControl;
    private realTimeCardsDiffusionControl: RealTimeCardsDiffusionControl;
    private checkPeriodInSeconds: number;
    private hourToSendDailyEmail: number;
    private minuteToSendDailyEmail: number;
    private active = false;
    private logger: any;

    constructor(
        opfabServicesInterface: CardsExternalDiffusionOpfabServicesInterface,
        opfabBusinessConfigServicesInterface: BusinessConfigOpfabServicesInterface,
        cardsExternalDiffusionDatabaseService: CardsExternalDiffusionDatabaseService,
        mailService: SendMailService,
        serviceConfig: any,
        logger: any
    ) {
        this.logger = logger;
        this.checkPeriodInSeconds = serviceConfig.checkPeriodInSeconds;
        this.hourToSendDailyEmail = serviceConfig.hourToSendDailyEmail;
        this.minuteToSendDailyEmail = serviceConfig.minuteToSendDailyEmail;

        this.dailyCardsDiffusionControl = new DailyCardsDiffusionControl()
            .setLogger(logger)
            .setOpfabUrlInMailContent(serviceConfig.opfabUrlInMailContent)
            .setOpfabServicesInterface(opfabServicesInterface)
            .setOpfabBusinessConfigServicesInterface(opfabBusinessConfigServicesInterface)
            .setCardsExternalDiffusionDatabaseService(cardsExternalDiffusionDatabaseService)
            .setMailService(mailService)
            .setDailyEmailTitle(serviceConfig.dailyEmailTitle)
            .setFrom(serviceConfig.mailFrom);

        this.realTimeCardsDiffusionControl = new RealTimeCardsDiffusionControl()
            .setLogger(logger)
            .setOpfabUrlInMailContent(serviceConfig.opfabUrlInMailContent)
            .setOpfabServicesInterface(opfabServicesInterface)
            .setOpfabBusinessConfigServicesInterface(opfabBusinessConfigServicesInterface)
            .setCardsExternalDiffusionDatabaseService(cardsExternalDiffusionDatabaseService)
            .setMailService(mailService)
            .setFrom(serviceConfig.mailFrom)
            .setSubjectPrefix(serviceConfig.subjectPrefix)
            .setBodyPrefix(serviceConfig.bodyPrefix)
            .setWindowInSecondsForCardSearch(serviceConfig.windowInSecondsForCardSearch)
            .setSecondsAfterPublicationToConsiderCardAsNotRead(
                serviceConfig.secondsAfterPublicationToConsiderCardAsNotRead
            );

        if (serviceConfig.activateCardsDiffusionRateLimiter) {
            const cardsDiffusionRateLimiter = new CardsDiffusionRateLimiter()
                .setLimitPeriodInSec(serviceConfig.sendRateLimitPeriodInSec)
                .setSendRateLimit(serviceConfig.sendRateLimit);
            this.realTimeCardsDiffusionControl.setCardsDiffusionRateLimiter(cardsDiffusionRateLimiter);
            this.realTimeCardsDiffusionControl.setActivateCardsDiffusionRateLimiter(true);
        }

        this.checkRegularly();
        this.checkDaily();
    }

    setConfiguration(serviceConfig: ConfigDTO) {
        if (serviceConfig.checkPeriodInSeconds) this.checkPeriodInSeconds = serviceConfig.checkPeriodInSeconds;

        this.realTimeCardsDiffusionControl.setConfiguration(serviceConfig);
        this.dailyCardsDiffusionControl.setConfiguration(serviceConfig);
        return this;
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

    private checkRegularly() {
        if (this.active) {
            this.logger.info('Check regularly');
            this.realTimeCardsDiffusionControl
                .checkUnreadCards()
                .catch((error) => this.logger.error('error during periodic check' + error))
                .finally(() => setTimeout(() => this.checkRegularly(), this.checkPeriodInSeconds * 1000));
        } else setTimeout(() => this.checkRegularly(), this.checkPeriodInSeconds * 1000);
    }

    private checkDaily() {
        if (this.active) {
            this.logger.info('Daily email scheduler launch');
            const millisBeforeSendingDailyEmail = this.getMillisBeforeSendingDailyEmail();
            
            setTimeout(() => {
                this.sendDailyRecap();
                setInterval(() => {
                    this.dailyCardsDiffusionControl.checkCardsOfTheDay();
                }, 24 * 60 * 60 * 1000);
            }, millisBeforeSendingDailyEmail);
        }
    }

    private getMillisBeforeSendingDailyEmail(): number {
        const now = new Date();
            const configHour = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate(),
                this.hourToSendDailyEmail,
                this.minuteToSendDailyEmail,
                0,
                0
            );
        let millisTillConfigHour = configHour.getTime() - now.getTime();
            if (millisTillConfigHour < 0) {
                millisTillConfigHour += MILLISECONDS_IN_A_DAY;
            }
        return millisTillConfigHour;
    }

    public async sendDailyRecap() {
        this.logger.info("Sending daily recap emails");
        try {
            await this.dailyCardsDiffusionControl.checkCardsOfTheDay();
        } catch (error) {
            this.logger.error("Could not send daily recap emails, " + error);
        }
    }
}
