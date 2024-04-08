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
import ConfigDTO from '../domain/client-side/configDTO';
import {SupervisorDatabaseServerStub} from './helpers/supervisorDatabasServerStub';
import {OpfabServicesInterfaceStub} from './helpers/opfabServicesInterfaceStub';
import SupervisorService from '../domain/client-side/supervisorService';
import {EntityToSupervise} from '../domain/application/entityToSupervise';

const logger = Logger.getLogger();

describe('supervisor config service', function () {
    function getDefaultConfig(): ConfigDTO {
        const defaultConfig = new ConfigDTO();
        defaultConfig.secondsBetweenConnectionChecks = 30;
        defaultConfig.secondsBetweenAcknowledgmentChecks = 30;
        const entities = [new EntityToSupervise('ENTITY1', ['ENTITY2'])];
        defaultConfig.entitiesToSupervise = entities;
        defaultConfig.nbOfConsecutiveNotConnectedToSendFirstCard = 2;
        return defaultConfig;
    }

    it('Patch configuration parameter secondsBetweenConnectionChecks should update it ', async function () {
        const defaultConfig = getDefaultConfig();
        const supervisorDatabaseService = new SupervisorDatabaseServerStub();
        const supervisorService = new SupervisorService(
            defaultConfig,
            null,
            supervisorDatabaseService,
            new OpfabServicesInterfaceStub(),
            logger
        );
        expect(supervisorService.getSupervisorConfig().secondsBetweenConnectionChecks).toEqual(30);
        supervisorService.patch({secondsBetweenConnectionChecks: 5});
        expect(supervisorService.getSupervisorConfig().secondsBetweenConnectionChecks).toEqual(5);
    });

    it('Patch configuration with wrong  params should be ignored', async function () {
        const defaultConfig = getDefaultConfig();
        const supervisorDatabaseService = new SupervisorDatabaseServerStub();
        const supervisorService = new SupervisorService(
            defaultConfig,
            null,
            supervisorDatabaseService,
            new OpfabServicesInterfaceStub(),
            logger
        );

        supervisorService.patch({secondsBetweenConnectionChecks: 10, wrongParam: 5});
        expect(supervisorService.getSupervisorConfig().secondsBetweenConnectionChecks).toEqual(10);
        expect((supervisorService.getSupervisorConfig() as any).wrongParam).toBeUndefined();
    });

    it('Patch entities to supervise shall not update entitiesToSupervise (as it should be update via save and delete methods', async function () {
        const defaultConfig = getDefaultConfig();
        const supervisorDatabaseService = new SupervisorDatabaseServerStub();
        const supervisorService = new SupervisorService(
            defaultConfig,
            null,
            supervisorDatabaseService,
            new OpfabServicesInterfaceStub(),
            logger
        );

        const entities = [{entityId: 'ENTITY4', supervisors: ['ENTITY3']}];
        supervisorService.patch({entitiesToSupervise: entities});
        expect(supervisorService.getSupervisorConfig().entitiesToSupervise).not.toEqual(entities);
        expect(supervisorService.getSupervisorConfig().entitiesToSupervise).toEqual(defaultConfig.entitiesToSupervise);
    });

    it('Init with empty entities to supervised in database should load default entities to supervise from config file', async function () {
        const defaultConfig = getDefaultConfig();
        const supervisorDatabaseService = new SupervisorDatabaseServerStub();

        const supervisorService = new SupervisorService(
            defaultConfig,
            null,
            supervisorDatabaseService,
            new OpfabServicesInterfaceStub(),
            logger
        );

        await supervisorService.init();
        expect(supervisorDatabaseService.supervisedEntities).toEqual(defaultConfig.entitiesToSupervise);
    });

    it('Init with entities to supervised in database should not load default entities to supervise from config file', async function () {
        const defaultConfig = getDefaultConfig();
        const supervisorDatabaseService = new SupervisorDatabaseServerStub();
        supervisorDatabaseService.supervisedEntities = [{entityId: 'ENTITY4', supervisors: ['ENTITY1']}];

        const supervisorService = new SupervisorService(
            defaultConfig,
            null,
            supervisorDatabaseService,
            new OpfabServicesInterfaceStub(),
            logger
        );

        await supervisorService.init();
        expect(supervisorService.getSupervisorConfig().entitiesToSupervise).toEqual([
            {entityId: 'ENTITY4', supervisors: ['ENTITY1']}
        ]);
    });

    it('Delete supervised Entity', async function () {
        const defaultConfig = getDefaultConfig();
        const supervisorDatabaseService = new SupervisorDatabaseServerStub();
        supervisorDatabaseService.supervisedEntities = [
            {entityId: 'ENTITY4', supervisors: ['ENTITY1']},
            {entityId: 'ENTITY3', supervisors: ['ENTITY2']}
        ];
        const supervisorService = new SupervisorService(
            defaultConfig,
            null,
            supervisorDatabaseService,
            new OpfabServicesInterfaceStub(),
            logger
        );

        await supervisorService.init();
        await supervisorService.deleteSupervisedEntity('ENTITY4');
        expect(supervisorService.getSupervisorConfig().entitiesToSupervise).toEqual([
            {entityId: 'ENTITY3', supervisors: ['ENTITY2']}
        ]);
    });
});

describe('Regulary check if entities are connected', function () {
    let opfabServicesInterface: OpfabServicesInterfaceStub;
    let supervisorService: SupervisorService;

    function getDefaultConfig(): ConfigDTO {
        const defaultConfig = new ConfigDTO();
        defaultConfig.secondsBetweenConnectionChecks = 30;
        defaultConfig.secondsBetweenAcknowledgmentChecks = 30;
        const entities = [new EntityToSupervise('ENTITY1', ['ENTITY2']), new EntityToSupervise('ENTITY3', ['ENTITY4'])];
        defaultConfig.entitiesToSupervise = entities;
        defaultConfig.nbOfConsecutiveNotConnectedToSendFirstCard = 2;
        return defaultConfig;
    }

    beforeEach(async () => {
        const defaultConfig = getDefaultConfig();
        const supervisorDatabaseService = new SupervisorDatabaseServerStub();
        opfabServicesInterface = new OpfabServicesInterfaceStub();
        opfabServicesInterface.setLogger(logger);
        supervisorService = new SupervisorService(
            defaultConfig,
            null,
            supervisorDatabaseService,
            opfabServicesInterface,
            logger
        );
        jest.useFakeTimers();
        await supervisorService.init();
        supervisorService.start();
    });

    afterEach(() => {
        jest.useRealTimers();
        supervisorService.stop();
    });

    it('Should be active', function () {
        expect(supervisorService.isActive()).toBeTruthy();
        supervisorService.stop();
        expect(supervisorService.isActive()).toBeFalsy();
    });

    it('Should check if entities are connected every 30 seconds', async function () {
        await jest.advanceTimersByTimeAsync(30000);
        expect(opfabServicesInterface.numberOfCardSend).toEqual(0);
        await jest.advanceTimersByTimeAsync(40000);
        expect(opfabServicesInterface.numberOfCardSend).toEqual(2);
    });

    it('Should remove entity form check when entity is removed from config', async function () {
        await supervisorService.deleteSupervisedEntity('ENTITY1');
        await jest.advanceTimersByTimeAsync(30000);
        expect(opfabServicesInterface.numberOfCardSend).toEqual(0);
        await jest.advanceTimersByTimeAsync(40000);
        expect(opfabServicesInterface.numberOfCardSend).toEqual(1);
    });

    it('Should add entity to check when entity is added to config', async function () {
        await supervisorService.saveSupervisedEntity({entityId: 'ENTITY5', supervisors: ['ENTITY6']});
        await jest.advanceTimersByTimeAsync(30000);
        expect(opfabServicesInterface.numberOfCardSend).toEqual(0);
        await jest.advanceTimersByTimeAsync(40000);
        expect(opfabServicesInterface.numberOfCardSend).toEqual(3);
    });
});
