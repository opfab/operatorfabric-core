/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */
import {EntityToSupervise} from './entityToSupervise';
import SupervisorDatabaseServer from '../server-side/supervisorDatabaseServer';
import ConfigDTO from '../client-side/configDTO';
import fs from 'fs';

export default class Config {
    supervisorDatabaseService: SupervisorDatabaseServer;
    supervisorConfig: ConfigDTO;
    configFilePath: string | null;
    logger: any;

    constructor(
        supervisorDatabaseService: SupervisorDatabaseServer,
        defaulConfig: any,
        configFilePath: string | null,
        logger: any
    ) {
        this.supervisorDatabaseService = supervisorDatabaseService;
        this.configFilePath = configFilePath;
        this.logger = logger;

        try {
            if (configFilePath != null && fs.existsSync(configFilePath)) {
                this.loadFromFile();
            } else {
                this.supervisorConfig = new ConfigDTO();
                this.supervisorConfig.secondsBetweenConnectionChecks = defaulConfig.secondsBetweenConnectionChecks;
                this.supervisorConfig.nbOfConsecutiveNotConnectedToSendFirstCard =
                    defaulConfig.nbOfConsecutiveNotConnectedToSendFirstCard;
                this.supervisorConfig.nbOfConsecutiveNotConnectedToSendSecondCard =
                    defaulConfig.nbOfConsecutiveNotConnectedToSendSecondCard;
                this.supervisorConfig.considerConnectedIfUserInGroups = defaulConfig.considerConnectedIfUserInGroups;
                this.supervisorConfig.entitiesToSupervise = defaulConfig.entitiesToSupervise;
                this.supervisorConfig.processesToSupervise = defaulConfig.processesToSupervise;
                this.supervisorConfig.windowInSecondsForCardSearch = defaulConfig.windowInSecondsForCardSearch;
                this.supervisorConfig.secondsBetweenAcknowledgmentChecks =
                    defaulConfig.secondsBetweenAcknowledgmentChecks;
                this.supervisorConfig.secondsAfterPublicationToConsiderCardAsNotAcknowledged =
                    defaulConfig.secondsAfterPublicationToConsiderCardAsNotAcknowledged;
                this.supervisorConfig.disconnectedCardTemplate = defaulConfig.disconnectedCardTemplate;
                this.supervisorConfig.unackCardTemplate = defaulConfig.unackCardTemplate;
                this.save();
            }
        } catch (err) {
            this.logger.error(err);
        }
    }

    public async synchronizeConfigWithDatabase(): Promise<ConfigDTO> {
        try {
            const entitiesToSupervise = await this.supervisorDatabaseService.getSupervisedEntities();
            this.logger.debug('Supervised entities from mongodb ' + JSON.stringify(entitiesToSupervise));

            if (entitiesToSupervise.length > 0) {
                this.supervisorConfig.entitiesToSupervise = entitiesToSupervise;
                this.save();
            } else {
                await this.initMongoDbFromConfigFile();
                // Need to reset with values from mongo to be consistent with objects type (objects from mongo contain _id field)
                this.supervisorConfig.entitiesToSupervise =
                    await this.supervisorDatabaseService.getSupervisedEntities();
            }
        } catch (error) {
            this.logger.error('Error synchronizing with database ' + JSON.stringify(error));
        }
        return this.supervisorConfig;
    }

    private async initMongoDbFromConfigFile(): Promise<void> {
        for (const entityToSupervise of this.supervisorConfig.entitiesToSupervise) {
            this.logger.debug('Add supervised entity ' + JSON.stringify(entityToSupervise));
            await this.supervisorDatabaseService.saveSupervisedEntity(entityToSupervise);
        }
    }

    public async saveSupervisedEntity(supervisedEntity: EntityToSupervise): Promise<void> {
        await this.supervisorDatabaseService.saveSupervisedEntity(supervisedEntity);

        const index = this.supervisorConfig.entitiesToSupervise.findIndex(
            (entity) => entity.entityId === supervisedEntity.entityId
        );
        if (index >= 0) {
            this.supervisorConfig.entitiesToSupervise.splice(index, 1);
        }
        this.supervisorConfig.entitiesToSupervise.push(supervisedEntity);
    }

    public async deleteSupervisedEntity(entityId: string): Promise<void> {
        await this.supervisorDatabaseService.deleteSupervisedEntity(entityId);

        const index = this.supervisorConfig.entitiesToSupervise.findIndex((entity) => entity.entityId === entityId);
        if (index >= 0) {
            this.supervisorConfig.entitiesToSupervise.splice(index, 1);
        }
    }

    private loadFromFile(): void {
        if (this.configFilePath != null) {
            const rawdata = fs.readFileSync(this.configFilePath);
            this.supervisorConfig = JSON.parse(rawdata.toString());
            if (this.supervisorConfig.entitiesToSupervise == null) this.supervisorConfig.entitiesToSupervise = [];
            if (this.supervisorConfig.processesToSupervise == null) this.supervisorConfig.processesToSupervise = [];
            if (this.supervisorConfig.considerConnectedIfUserInGroups == null)
                this.supervisorConfig.considerConnectedIfUserInGroups = [];
        }
    }

    private save(): void {
        if (this.configFilePath != null) {
            const data = JSON.stringify(this.supervisorConfig);
            fs.writeFileSync(this.configFilePath, data);
        }
    }

    getSupervisorConfig(): ConfigDTO {
        return this.supervisorConfig;
    }

    public patch(update: object): ConfigDTO {
        try {
            for (const [key, value] of Object.entries(update)) {
                if (
                    Object.prototype.hasOwnProperty.call(this.supervisorConfig, key) &&
                    value != null &&
                    key !== 'entitiesToSupervise'
                ) {
                    (this.supervisorConfig as any)[key] = value;
                }
            }
            this.save();
        } catch (error) {
            this.logger.error(error);
        }

        return this.supervisorConfig;
    }
}
