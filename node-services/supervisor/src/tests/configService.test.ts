/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import 'jest';
import Logger from '../common/server-side/logger';
import ConfigService from '../domain/client-side/configService';
import ConfigDTO from '../domain/client-side/configDTO';
import SupervisorDatabaseService from '../domain/server-side/supervisorDatabaseService';

class SupervisorDatabaseServiceStub extends SupervisorDatabaseService {
    public supervisedEntities: any[] = [];

    public async getSupervisedEntities(): Promise<any[]> {
        return this.supervisedEntities;
    }

    public async saveSupervisedEntity(supervisedEntity: any): Promise<void> {
        const index = this.supervisedEntities.findIndex((entity) => entity.entityId === supervisedEntity.entityId);
        if (index >= 0) {
            this.supervisedEntities.splice(index);
        }
        this.supervisedEntities.push(supervisedEntity);
    }

    public async deleteSupervisedEntity(id: string): Promise<void> {
        const index = this.supervisedEntities.findIndex((entity) => entity.entityId === id);
        if (index >= 0) {
            this.supervisedEntities.splice(index);
        }
    }
}

function getDefaultConfig(): ConfigDTO {
    const defaultConfig = new ConfigDTO();
    defaultConfig.secondsBetweenConnectionChecks = 30;
    const entities = [{entityId: 'ENTITY1', supervisors: ['ENTITY2']}];
    defaultConfig.entitiesToSupervise = entities;
    return defaultConfig;
}

const logger = Logger.getLogger();

describe('config service', function () {
    it('Update config params ', async function () {
        const defaultConfig = getDefaultConfig();
        const supervisorDatabaseService = new SupervisorDatabaseServiceStub();
        const configService = new ConfigService(supervisorDatabaseService, defaultConfig, null, logger);
        expect(configService.getSupervisorConfig().secondsBetweenConnectionChecks).toEqual(30);
        expect(configService.getSupervisorConfig().entitiesToSupervise).toEqual([
            {entityId: 'ENTITY1', supervisors: ['ENTITY2']}
        ]);

        const confUpdate = {secondsBetweenConnectionChecks: 5};

        configService.patch(confUpdate);
        expect(configService.getSupervisorConfig().secondsBetweenConnectionChecks).toEqual(5);
        expect(configService.getSupervisorConfig().entitiesToSupervise).toEqual([
            {entityId: 'ENTITY1', supervisors: ['ENTITY2']}
        ]);

        const updateEntities = {entitiesToSupervise: [{entityId: 'ENTITY3', supervisors: ['ENTITY4']}]};
        configService.patch(updateEntities);
        expect(configService.getSupervisorConfig().secondsBetweenConnectionChecks).toEqual(5);
        expect(configService.getSupervisorConfig().entitiesToSupervise).toEqual([
            {entityId: 'ENTITY3', supervisors: ['ENTITY4']}
        ]);
    });

    it('Wrong config params are ignored', async function () {
        const defaultConfig = getDefaultConfig();
        const supervisorDatabaseService = new SupervisorDatabaseServiceStub();

        const configService = new ConfigService(supervisorDatabaseService, defaultConfig, null, logger);

        const confUpdate = {secondsBetweenConnectionChecks: 10, wrongParam: 5};

        configService.patch(confUpdate);
        expect(configService.getSupervisorConfig().secondsBetweenConnectionChecks).toEqual(10);
        expect(configService.getSupervisorConfig().entitiesToSupervise).toEqual([
            {entityId: 'ENTITY1', supervisors: ['ENTITY2']}
        ]);
    });

    it('Synchronize with mongodb and mongodb supervisedEntities is empty', async function () {
        const defaultConfig = getDefaultConfig();
        const supervisorDatabaseService = new SupervisorDatabaseServiceStub();

        const configService = new ConfigService(supervisorDatabaseService, defaultConfig, null, logger);

        await configService.synchronizeWithMongoDb();
        expect(supervisorDatabaseService.supervisedEntities).toEqual(defaultConfig.entitiesToSupervise);
    });

    it('Synchronize with mongodb and mongodb supervisedEntities is not empty', async function () {
        const defaultConfig = getDefaultConfig();
        const supervisorDatabaseService = new SupervisorDatabaseServiceStub();
        supervisorDatabaseService.supervisedEntities = [{entityId: 'ENTITY4', supervisors: ['ENTITY1']}];

        const configService = new ConfigService(supervisorDatabaseService, defaultConfig, null, logger);

        await configService.synchronizeWithMongoDb();
        expect(configService.getSupervisorConfig().entitiesToSupervise).toEqual([
            {entityId: 'ENTITY4', supervisors: ['ENTITY1']}
        ]);
    });

    it('Delete supervised Entity', async function () {
        const defaultConfig = getDefaultConfig();
        const supervisorDatabaseService = new SupervisorDatabaseServiceStub();
        supervisorDatabaseService.supervisedEntities = [
            {entityId: 'ENTITY4', supervisors: ['ENTITY1']},
            {entityId: 'ENTITY3', supervisors: ['ENTITY2']}
        ];

        const configService = new ConfigService(supervisorDatabaseService, defaultConfig, null, logger);

        await configService.synchronizeWithMongoDb();
        expect(configService.getSupervisorConfig().entitiesToSupervise).toEqual([
            {entityId: 'ENTITY4', supervisors: ['ENTITY1']},
            {entityId: 'ENTITY3', supervisors: ['ENTITY2']}
        ]);

        await configService.deleteSupervisedEntity('ENTITY3');
        expect(configService.getSupervisorConfig().entitiesToSupervise).toEqual([
            {entityId: 'ENTITY4', supervisors: ['ENTITY1']}
        ]);
    });
});
