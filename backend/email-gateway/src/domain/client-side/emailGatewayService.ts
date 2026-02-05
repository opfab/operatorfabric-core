/* Copyright (c) 2023-2026, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import CardsDiffusionRateLimiter from '../application/cardsDiffusionRateLimiter';
import EmailGatewayDatabaseService from '../server-side/emailGatewayDatabaseService';
import BusinessConfigOpfabServicesInterface from '../server-side/BusinessConfigOpfabServicesInterface';
import EmailGatewayOpfabServicesInterface from '../server-side/emailGatewayOpfabServicesInterface';
import SendMailService from '../server-side/sendMailService';
import ConfigDTO from './configDTO';
import RecapCardsDiffusionControl from '../application/recapCardsDiffusionControl';
import RealTimeCardsDiffusionControl from '../application/realTimeCardsDiffusionControl';

const MILLISECONDS_IN_A_DAY = 24 * 60 * 60 * 1000;
const MILLISECONDS_IN_A_WEEK = 7 * MILLISECONDS_IN_A_DAY;

export default class EmailGatewayService {
    private readonly recapCardsDiffusionControl: RecapCardsDiffusionControl;
    private readonly realTimeCardsDiffusionControl: RealTimeCardsDiffusionControl;
    private checkPeriodInSeconds: number;
    private readonly hourToSendRecapEmail: number;
    private readonly minuteToSendRecapEmail: number;
    private readonly dayOfWeekToSendWeeklyRecapEmail: number;
    private active = false;
    private readonly logger: any;

    constructor(
        opfabServicesInterface: EmailGatewayOpfabServicesInterface,
        opfabBusinessConfigServicesInterface: BusinessConfigOpfabServicesInterface,
        emailGatewayDatabaseService: EmailGatewayDatabaseService,
        mailService: SendMailService,
        serviceConfig: any,
        logger: any
    ) {
        this.logger = logger;
        this.checkPeriodInSeconds = serviceConfig.outgoingEmails.checkPeriodInSeconds;
        this.hourToSendRecapEmail = serviceConfig.outgoingEmails.hourToSendRecapEmail;
        this.minuteToSendRecapEmail = serviceConfig.outgoingEmails.minuteToSendRecapEmail;
        this.dayOfWeekToSendWeeklyRecapEmail = serviceConfig.outgoingEmails.dayOfWeekToSendWeeklyRecapEmail;

        this.recapCardsDiffusionControl = new RecapCardsDiffusionControl()
            .setLogger(logger)
            .setOpfabUrlInMailContent(serviceConfig.outgoingEmails.opfabUrlInMailContent)
            .setOpfabServicesInterface(opfabServicesInterface)
            .setOpfabBusinessConfigServicesInterface(opfabBusinessConfigServicesInterface)
            .setEmailGatewayDatabaseService(emailGatewayDatabaseService)
            .setMailService(mailService)
            .setDailyEmailTitle(serviceConfig.outgoingEmails.dailyEmailTitle as string)
            .setWeeklyEmailTitle(serviceConfig.outgoingEmails.weeklyEmailTitle as string)
            .setDailyEmailBodyPrefix(serviceConfig.outgoingEmails.dailyEmailBodyPrefix as string)
            .setWeeklyEmailBodyPrefix(serviceConfig.outgoingEmails.weeklyEmailBodyPrefix as string)
            .setBodyPostfix(serviceConfig.outgoingEmails.bodyPostfix as string)
            .setFrom(serviceConfig.outgoingEmails.mailFrom as string)
            .setDefaultTimeZone((serviceConfig.outgoingEmails.defaultTimeZone as string) ?? 'Europe/Paris')
            .setShowCardUrls(serviceConfig.outgoingEmails.showCardUrls ?? true)
            .setForceEmailsInPlainText(serviceConfig.outgoingEmails.forceEmailsInPlainText ?? false);

        this.realTimeCardsDiffusionControl = new RealTimeCardsDiffusionControl()
            .setLogger(logger)
            .setOpfabUrlInMailContent(serviceConfig.outgoingEmails.opfabUrlInMailContent)
            .setOpfabServicesInterface(opfabServicesInterface)
            .setOpfabBusinessConfigServicesInterface(opfabBusinessConfigServicesInterface)
            .setEmailGatewayDatabaseService(emailGatewayDatabaseService)
            .setMailService(mailService)
            .setFrom(serviceConfig.outgoingEmails.mailFrom as string)
            .setSubjectPrefix(serviceConfig.outgoingEmails.subjectPrefix as string)
            .setBodyPrefix(serviceConfig.outgoingEmails.bodyPrefix as string)
            .setBodyPostfix(serviceConfig.outgoingEmails.bodyPostfix as string)
            .setPublisherEntityPrefix(serviceConfig.outgoingEmails.publisherEntityPrefix as string)
            .setWindowInSecondsForCardSearch(serviceConfig.outgoingEmails.windowInSecondsForCardSearch as number)
            .setDefaultTimeZone((serviceConfig.outgoingEmails.defaultTimeZone as string) ?? 'Europe/Paris')
            .setCustomConfig(serviceConfig.outgoingEmails.customConfig)
            .setShowCardUrls(serviceConfig.outgoingEmails.showCardUrls ?? true)
            .setForceEmailsInPlainText(serviceConfig.outgoingEmails.forceEmailsInPlainText ?? false)
            .setShowCardTitleInBody(serviceConfig.outgoingEmails.showCardTitleInBody ?? true);

        if (serviceConfig.outgoingEmails.activateCardsDiffusionRateLimiter) {
            this.logger.info(
                'Activating cards diffusion rate limiter with send rate limit of ' +
                    serviceConfig.outgoingEmails.sendRateLimit +
                    ' mails per recipients per ' +
                    serviceConfig.outgoingEmails.sendRateLimitPeriodInSec +
                    ' seconds'
            );
            const cardsDiffusionRateLimiter = new CardsDiffusionRateLimiter()
                .setLimitPeriodInSec(serviceConfig.outgoingEmails.sendRateLimitPeriodInSec as number)
                .setSendRateLimit(serviceConfig.outgoingEmails.sendRateLimit as number);
            this.realTimeCardsDiffusionControl.setCardsDiffusionRateLimiter(cardsDiffusionRateLimiter);
            this.realTimeCardsDiffusionControl.setActivateCardsDiffusionRateLimiter(true);
        }
        this.logger.info('Starting checks');
        this.checkRegularly();
        this.checkDaily();
        this.checkWeekly();
    }

    setConfiguration(serviceConfig: ConfigDTO): this {
        if (serviceConfig.outgoingEmails.checkPeriodInSeconds != null)
            this.checkPeriodInSeconds = serviceConfig.outgoingEmails.checkPeriodInSeconds;

        this.realTimeCardsDiffusionControl.setConfiguration(serviceConfig.outgoingEmails);
        this.recapCardsDiffusionControl.setConfiguration(serviceConfig.outgoingEmails);
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
        const millisBeforeSendingDailyEmail = this.getMillisBeforeSendingRecapEmail('daily');

        setTimeout(() => {
            if (this.active) {
                this.sendDailyRecap().catch((error) => this.logger.error('error during daily email sending' + error));
                this.checkDaily();
            }
        }, millisBeforeSendingDailyEmail);
    }

    private checkWeekly(): void {
        const millisBeforeSendingWeeklyEmail = this.getMillisBeforeSendingRecapEmail('weekly');
        setTimeout(() => {
            if (this.active) {
                this.sendWeeklyRecap().catch((error) => this.logger.error('error during weekly email sending' + error));
                this.checkWeekly();
            }
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
