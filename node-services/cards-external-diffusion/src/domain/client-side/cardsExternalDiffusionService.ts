/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import CardsDiffusionControl from '../application/cardsDiffusionControl';
import OpfabServicesInterface from '../server-side/opfabServicesInterface';
import SendMailService from '../server-side/sendMailService';
import ConfigDTO from './configDTO';


export default class CardsExternalDiffusionService {

    private cardsDiffusionControl: CardsDiffusionControl;
    private checkPeriodInSeconds: number;
    private active = false;
    private logger: any;


    constructor(opfabServicesInterface: OpfabServicesInterface, mailService: SendMailService, serviceConfig: any, logger: any) {
        this.logger = logger;
        this.checkPeriodInSeconds = serviceConfig.checkPeriodInSeconds;

        this.cardsDiffusionControl = new CardsDiffusionControl()
            .setLogger(logger)
            .setOpfabServicesInterface(opfabServicesInterface)
            .setMailService(mailService)
            .setFrom(serviceConfig.mailFrom)
            .setSubjectPrefix(serviceConfig.subjectPrefix)
            .setBodyPrefix(serviceConfig.bodyPrefix)
            .setWindowInSecondsForCardSearch(serviceConfig.windowInSecondsForCardSearch)
            .setSecondsAfterPublicationToConsiderCardAsNotRead(serviceConfig.secondsAfterPublicationToConsiderCardAsNotRead);

        this.checkRegularly().catch(error =>
            this.logger.error("error during periodic check" + error)
        );
    }

    setConfiguration(serviceConfig: ConfigDTO) {
        if (serviceConfig.checkPeriodInSeconds)
            this.checkPeriodInSeconds = serviceConfig.checkPeriodInSeconds;
        
        this.cardsDiffusionControl.setConfiguration(serviceConfig);
        return this;
    }

    public start() {
        this.active = true;
        this.checkRegularly().catch(error =>
            this.logger.error("error during periodic check" + error)
        );
    }

    public stop() {
        this.active = false;
    }

    private async checkRegularly() {
        if (this.active) {
            this.logger.info("checkRegularly");
            await this.cardsDiffusionControl.checkUnreadCards();
            setTimeout(() => this.checkRegularly(), this.checkPeriodInSeconds * 1000);

        }
    }

}
