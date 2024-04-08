/* Copyright (c) 2022-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import AcknowledgementChecker from './acknowledgmentChecker';
import ConnectionChecker from './connectionChecker';
import OpfabServicesInterface from '../../common/server-side/opfabServicesInterface';
import Config from './config';
import SupervisorDatabaseService from '../server-side/supervisorDatabaseService';
import {EntityToSupervise} from './entityToSupervise';
import ConfigDTO from './../client-side/configDTO';

export default class SupervisorApplication {
    private connectionChecker: ConnectionChecker;
    private acknowledgementChecker: AcknowledgementChecker;
    private readonly opfabInterface: OpfabServicesInterface;
    private active = false;
    private readonly config: Config;

    constructor(
        defaulConfig: any,
        configFilePath: string | null,
        private readonly supervisorDatabaseService: SupervisorDatabaseService,
        opfabInterface: OpfabServicesInterface,
        private readonly logger: any
    ) {
        this.config = new Config(supervisorDatabaseService, defaulConfig, configFilePath, logger);
        this.opfabInterface = opfabInterface;
    }

    public async init(): Promise<void> {
        await this.supervisorDatabaseService.openConnection();
        await this.config.synchronizeConfigWithDatabase();
    }

    public async saveSupervisedEntity(supervisedEntity: EntityToSupervise): Promise<void> {
        await this.config.saveSupervisedEntity(supervisedEntity);
        this.resetConnectionChecker();
    }

    public async deleteSupervisedEntity(entityId: string): Promise<void> {
        await this.config.deleteSupervisedEntity(entityId);
        this.resetConnectionChecker();
    }

    public patch(update: object): ConfigDTO {
        const newConfig = this.config.patch(update);
        this.resetConnectionChecker();
        this.resetAcknowledgementChecker();
        return newConfig;
    }

    public getSupervisorConfig(): ConfigDTO {
        return this.config.getSupervisorConfig();
    }

    private resetConnectionChecker(): void {
        const supConfig = this.config.getSupervisorConfig();
        this.connectionChecker = new ConnectionChecker()
            .setLogger(this.logger)
            .setOpfabServicesInterface(this.opfabInterface)
            .setSecondsBetweenConnectionChecks(supConfig.secondsBetweenConnectionChecks)
            .setNbOfConsecutiveNotConnectedToSendFirstCard(supConfig.nbOfConsecutiveNotConnectedToSendFirstCard)
            .setNbOfConsecutiveNotConnectedToSendSecondCard(supConfig.nbOfConsecutiveNotConnectedToSendSecondCard)
            .setDisconnectedCardTemplate(supConfig.disconnectedCardTemplate)
            .setEntitiesToSupervise(supConfig.entitiesToSupervise)
            .setConsiderConnectedIfUserInGroups(supConfig.considerConnectedIfUserInGroups);
    }

    private resetAcknowledgementChecker(): void {
        const supConfig = this.config.getSupervisorConfig();
        this.acknowledgementChecker = new AcknowledgementChecker()
            .setLogger(this.logger)
            .setOpfabServicesInterface(this.opfabInterface)
            .setSecondsAfterPublicationToConsiderCardAsNotAcknowledged(
                supConfig.secondsAfterPublicationToConsiderCardAsNotAcknowledged
            )
            .setWindowInSecondsForCardSearch(supConfig.windowInSecondsForCardSearch)
            .setUnackedCardTemplate(supConfig.unackCardTemplate)
            .setProcessStatesToSupervise(supConfig.processesToSupervise);
    }

    public start(): void {
        this.resetConnectionChecker();
        this.resetAcknowledgementChecker();
        this.checkConnectionRegularly();
        this.checkAcknowledgmentRegularly();
        this.active = true;
    }

    public stop(): void {
        this.active = false;
        this.connectionChecker.resetState();
    }

    public isActive(): boolean {
        return this.active;
    }

    private checkConnectionRegularly(): void {
        if (this.active) {
            this.logger.info('checkConnectionRegularly');
            this.connectionChecker
                .checkConnection()
                .catch((error) => this.logger.error('error during periodic connections check' + error));
        }
        setTimeout(() => {
            this.checkConnectionRegularly();
        }, this.config.getSupervisorConfig().secondsBetweenConnectionChecks * 1000);
    }

    private checkAcknowledgmentRegularly(): void {
        if (this.active) {
            this.logger.info('checkAcknowledgmentRegularly');
            this.acknowledgementChecker
                .checkAcknowledgment()
                .catch((error) => this.logger.error('error during periodic acknowledgment check' + error));
        }
        setTimeout(() => {
            this.checkAcknowledgmentRegularly();
        }, this.config.getSupervisorConfig().secondsBetweenAcknowledgmentChecks * 1000);
    }
}
