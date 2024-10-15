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
    private readonly dailyCardsDiffusionControl: DailyCardsDiffusionControl;
    private readonly realTimeCardsDiffusionControl: RealTimeCardsDiffusionControl;
    private checkPeriodInSeconds: number;
    private readonly hourToSendDailyEmail: number;
    private readonly minuteToSendDailyEmail: number;
    private active = false;
    private readonly logger: any;

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
            .setDailyEmailTitle(serviceConfig.dailyEmailTitle as string)
            .setFrom(serviceConfig.mailFrom as string)
            .setDefaultTimeZone((serviceConfig.defaultTimeZone as string) ?? 'Europe/Paris');

        this.realTimeCardsDiffusionControl = new RealTimeCardsDiffusionControl()
            .setLogger(logger)
            .setOpfabUrlInMailContent(serviceConfig.opfabUrlInMailContent)
            .setOpfabServicesInterface(opfabServicesInterface)
            .setOpfabBusinessConfigServicesInterface(opfabBusinessConfigServicesInterface)
            .setCardsExternalDiffusionDatabaseService(cardsExternalDiffusionDatabaseService)
            .setMailService(mailService)
            .setFrom(serviceConfig.mailFrom as string)
            .setSubjectPrefix(serviceConfig.subjectPrefix as string)
            .setBodyPrefix(serviceConfig.bodyPrefix as string)
            .setBodyPostfix(serviceConfig.bodyPostfix as string)
            .setPublisherEntityPrefix(serviceConfig.publisherEntityPrefix as string)
            .setWindowInSecondsForCardSearch(serviceConfig.windowInSecondsForCardSearch as number)
            .setDefaultTimeZone((serviceConfig.defaultTimeZone as string) ?? 'Europe/Paris');

        if (serviceConfig.activateCardsDiffusionRateLimiter != null) {
            const cardsDiffusionRateLimiter = new CardsDiffusionRateLimiter()
                .setLimitPeriodInSec(serviceConfig.sendRateLimitPeriodInSec as number)
                .setSendRateLimit(serviceConfig.sendRateLimit as number);
            this.realTimeCardsDiffusionControl.setCardsDiffusionRateLimiter(cardsDiffusionRateLimiter);
            this.realTimeCardsDiffusionControl.setActivateCardsDiffusionRateLimiter(true);
        }

        this.checkRegularly();
        this.checkDaily();
    }

    setConfiguration(serviceConfig: ConfigDTO): this {
        if (serviceConfig.checkPeriodInSeconds != null) this.checkPeriodInSeconds = serviceConfig.checkPeriodInSeconds;

        this.realTimeCardsDiffusionControl.setConfiguration(serviceConfig);
        this.dailyCardsDiffusionControl.setConfiguration(serviceConfig);
        return this;
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

    private checkRegularly(): void {
        if (this.active) {
            this.logger.info('Check regularly');
            this.realTimeCardsDiffusionControl
                .checkCardsNeedToBeSent()
                .catch((error) => this.logger.error('error during periodic check' + error))
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

    private checkDaily(): void {
        this.logger.info('Daily email scheduler launch');
        const millisBeforeSendingDailyEmail = this.getMillisBeforeSendingDailyEmail();

        setTimeout(() => {
            if (this.active)
                this.sendDailyRecap().catch((error) => this.logger.error('error during daily email sending' + error));
            setInterval(
                () => {
                    if (this.active)
                        this.sendDailyRecap().catch((error) =>
                            this.logger.error('error during daily email sending' + error)
                        );
                },
                24 * 60 * 60 * 1000
            );
        }, millisBeforeSendingDailyEmail);
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

    public async sendDailyRecap(): Promise<void> {
        this.logger.info('Sending daily recap emails');
        try {
            await this.dailyCardsDiffusionControl.checkCardsOfTheDay();
        } catch (error) {
            this.logger.error('Could not send daily recap emails, ' + JSON.stringify(error));
        }
    }
}
