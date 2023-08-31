/* Copyright (c) 2022-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import AcknowledgementChecker from '../application/acknowledgmentChecker';
import ConnectionChecker from '../application/connectionChecker';
import OpfabServicesInterface from '../../common/server-side/opfabServicesInterface';
import ConfigDTO from './configDTO';

export default class SupervisorService {
    private connectionChecker: ConnectionChecker;
    private acknowledgementChecker: AcknowledgementChecker;
    private opfabInterface: OpfabServicesInterface;
    private config: ConfigDTO;
    private active = false;
    private logger: any;


    constructor(config: ConfigDTO, opfabInterface: OpfabServicesInterface, logger: any) {
        this.config = config;
        this.opfabInterface = opfabInterface;
        this.logger = logger;

        this.connectionChecker = new ConnectionChecker()
            .setLogger(this.logger)
            .setOpfabServicesInterface(this.opfabInterface)
            .setSecondsBetweenConnectionChecks(this.config.secondsBetweenConnectionChecks)
            .setNbOfConsecutiveNotConnectedToSendFirstCard(this.config.nbOfConsecutiveNotConnectedToSendFirstCard)
            .setNbOfConsecutiveNotConnectedToSendSecondCard(this.config.nbOfConsecutiveNotConnectedToSendSecondCard)
            .setDisconnectedCardTemplate(this.config.disconnectedCardTemplate)
            .setEntitiesToSupervise(this.config.entitiesToSupervise);

        this.acknowledgementChecker = new AcknowledgementChecker()
            .setLogger(this.logger)
            .setOpfabServicesInterface(this.opfabInterface)
            .setSecondsAfterPublicationToConsiderCardAsNotAcknowledged(this.config.secondsAfterPublicationToConsiderCardAsNotAcknowledged)
            .setWindowInSecondsForCardSearch(this.config.windowInSecondsForCardSearch )
            .setUnackedCardTemplate(this.config.unackCardTemplate)
            .setProcessStatesToSupervise(this.config.processesToSupervise);

        this.checkConnectionRegularly();
        this.checkAcknowledgmentRegularly();
    }

    public setConfiguration(config: ConfigDTO) {
        this.config = config;
        this.restartConnectionChecker();
        this.restartAcknowledgementChecker();
    }

    private restartConnectionChecker() {
        this.connectionChecker.setSecondsBetweenConnectionChecks(this.config.secondsBetweenConnectionChecks)
            .setNbOfConsecutiveNotConnectedToSendFirstCard(this.config.nbOfConsecutiveNotConnectedToSendFirstCard)
            .setNbOfConsecutiveNotConnectedToSendSecondCard(this.config.nbOfConsecutiveNotConnectedToSendSecondCard)
            .setDisconnectedCardTemplate(this.config.disconnectedCardTemplate)
            .setEntitiesToSupervise(this.config.entitiesToSupervise);
    }

    private restartAcknowledgementChecker() {
        this.acknowledgementChecker
            .setSecondsAfterPublicationToConsiderCardAsNotAcknowledged(this.config.secondsAfterPublicationToConsiderCardAsNotAcknowledged)
            .setWindowInSecondsForCardSearch(this.config.windowInSecondsForCardSearch )
            .setUnackedCardTemplate(this.config.unackCardTemplate)
            .setProcessStatesToSupervise(this.config.processesToSupervise);

    }

    public start() {
        this.active = true;
    }

    public stop() {
        this.active = false;
        this.connectionChecker.resetState();
    }

    public isActive() : boolean {
        return this.active;
    }
    
    private checkConnectionRegularly() {
        if (this.active) {
            this.logger.info("checkConnectionRegularly");
            this.connectionChecker.checkConnection().catch (error =>     
                this.logger.error("error during periodic connections check" + error)
            )
        }
        setTimeout(() => this.checkConnectionRegularly(), this.config.secondsBetweenConnectionChecks * 1000);
    }

    private checkAcknowledgmentRegularly() {
        if (this.active) {
            this.logger.info("checkAcknowledgmentRegularly");
            this.acknowledgementChecker.checkAcknowledgment().catch (error =>     
                this.logger.error("error during periodic acknowledgment check" + error)
            )
        }
        setTimeout(() => this.checkAcknowledgmentRegularly(), this.config.secondsBetweenAcknowledgmentChecks * 1000);
    }
}
