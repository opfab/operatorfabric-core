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
import RecapCardsDiffusionControl from '../application/recapCardsDiffusionControl';
import RealTimeCardsDiffusionControl from '../application/realTimeCardsDiffusionControl';

const MILLISECONDS_IN_A_DAY = 24 * 60 * 60 * 1000;
const MILLISECONDS_IN_A_WEEK = 7 * MILLISECONDS_IN_A_DAY;

export default class CardsExternalDiffusionService {
    private readonly recapCardsDiffusionControl: RecapCardsDiffusionControl;
    private readonly realTimeCardsDiffusionControl: RealTimeCardsDiffusionControl;
    private checkPeriodInSeconds: number;
    private readonly hourToSendRecapEmail: number;
    private readonly minuteToSendRecapEmail: number;
    private readonly dayOfWeekToSendWeeklyRecapEmail: number;
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
        this.hourToSendRecapEmail = serviceConfig.hourToSendRecapEmail;
        this.minuteToSendRecapEmail = serviceConfig.minuteToSendRecapEmail;
        this.dayOfWeekToSendWeeklyRecapEmail = serviceConfig.dayOfWeekToSendWeeklyRecapEmail;

        this.recapCardsDiffusionControl = new RecapCardsDiffusionControl()
            .setLogger(logger)
            .setOpfabUrlInMailContent(serviceConfig.opfabUrlInMailContent)
            .setOpfabServicesInterface(opfabServicesInterface)
            .setOpfabBusinessConfigServicesInterface(opfabBusinessConfigServicesInterface)
            .setCardsExternalDiffusionDatabaseService(cardsExternalDiffusionDatabaseService)
            .setMailService(mailService)
            .setDailyEmailTitle(serviceConfig.dailyEmailTitle as string)
            .setWeeklyEmailTitle(serviceConfig.weeklyEmailTitle as string)
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
        this.logger.info('Starting checks');
        this.checkRegularly();
        this.checkDaily();
        this.checkWeekly();
    }

    setConfiguration(serviceConfig: ConfigDTO): this {
        if (serviceConfig.checkPeriodInSeconds != null) this.checkPeriodInSeconds = serviceConfig.checkPeriodInSeconds;

        this.realTimeCardsDiffusionControl.setConfiguration(serviceConfig);
        this.recapCardsDiffusionControl.setConfiguration(serviceConfig);
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
        const millisBeforeSendingDailyEmail = this.getMillisBeforeSendingRecapEmail('daily');

        setTimeout(() => {
            if (this.active)
                this.sendDailyRecap().catch((error) => this.logger.error('error during daily email sending' + error));
            setInterval(() => {
                if (this.active)
                    this.sendDailyRecap().catch((error) =>
                        this.logger.error('error during daily email sending' + error)
                    );
            }, MILLISECONDS_IN_A_DAY);
        }, millisBeforeSendingDailyEmail);
    }

    private checkWeekly(): void {
        this.logger.info('Weekly email scheduler launch');
        const millisBeforeSendingWeeklyEmail = this.getMillisBeforeSendingRecapEmail('weekly');
        setTimeout(() => {
            if (this.active)
                this.sendWeeklyRecap().catch((error) => this.logger.error('error during weekly email sending' + error));
            setInterval(() => {
                if (this.active)
                    this.sendWeeklyRecap().catch((error) =>
                        this.logger.error('error during weekly email sending' + error)
                    );
            }, MILLISECONDS_IN_A_WEEK);
        }, millisBeforeSendingWeeklyEmail);
    }

    private getMillisBeforeSendingRecapEmail(mode: string): number {
        const now = new Date();
        const configTime = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            this.hourToSendRecapEmail,
            this.minuteToSendRecapEmail,
            0,
            0
        );
        let millisUntilConfigTime = 0;
        switch (mode) {
            case 'daily':
                millisUntilConfigTime = configTime.getTime() - now.getTime();
                if (millisUntilConfigTime < 0) {
                    millisUntilConfigTime += MILLISECONDS_IN_A_DAY;
                }
                this.logger.info(
                    'Next daily email is scheduled at : ' + new Date(now.getTime() + millisUntilConfigTime)
                );
                break;
            case 'weekly':
                configTime.setDate(configTime.getDate() - configTime.getDay() + this.dayOfWeekToSendWeeklyRecapEmail);
                millisUntilConfigTime = configTime.getTime() - now.getTime();
                if (millisUntilConfigTime < 0) {
                    millisUntilConfigTime += MILLISECONDS_IN_A_WEEK;
                }
                this.logger.info(
                    'Next weekly email is scheduled at : ' + new Date(now.getTime() + millisUntilConfigTime)
                );
                break;
            default:
                return 0;
        }
        return millisUntilConfigTime;
    }

    public async sendDailyRecap(): Promise<void> {
        this.logger.info('Sending daily recap emails');
        try {
            await this.recapCardsDiffusionControl.checkCardsStartingFrom('daily');
        } catch (error) {
            this.logger.error('Could not send daily recap emails, ' + JSON.stringify(error));
        }
    }

    public async sendWeeklyRecap(): Promise<void> {
        this.logger.info('Sending Weekly recap emails');
        try {
            await this.recapCardsDiffusionControl.checkCardsStartingFrom('weekly');
        } catch (error) {
            this.logger.error('Could not send weekly recap emails, ' + JSON.stringify(error));
        }
    }
}
