/* Copyright (c) 2022-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import OpfabServicesInterface from '../../common/server-side/opfabServicesInterface';
import SupervisorDatabaseServer from '../server-side/supervisorDatabaseServer';
import {EntityToSupervise} from '../application/entityToSupervise';
import ConfigDTO from './configDTO';
import SupervisorApplication from '../application/supervisorApplication';

export default class SupervisorService {
    private readonly supervisorApplication: SupervisorApplication;

    constructor(
        defaultConfig: any,
        configFilePath: string | null,
        supervisorDatabaseServer: SupervisorDatabaseServer,
        opfabInterface: OpfabServicesInterface,
        private readonly logger: any
    ) {
        this.supervisorApplication = new SupervisorApplication(
            defaultConfig,
            configFilePath,
            supervisorDatabaseServer,
            opfabInterface,
            logger
        );
    }

    public async init(): Promise<void> {
        await this.supervisorApplication.init();
    }

    public async saveSupervisedEntity(supervisedEntity: EntityToSupervise): Promise<void> {
        await this.supervisorApplication.saveSupervisedEntity(supervisedEntity);
    }

    public async deleteSupervisedEntity(entityId: string): Promise<void> {
        await this.supervisorApplication.deleteSupervisedEntity(entityId);
    }

    public patch(update: object): ConfigDTO {
        return this.supervisorApplication.patch(update);
    }

    public getSupervisorConfig(): ConfigDTO {
        return this.supervisorApplication.getSupervisorConfig();
    }

    public start(): void {
        this.supervisorApplication.start();
    }

    public stop(): void {
        this.supervisorApplication.stop();
    }

    public isActive(): boolean {
        return this.supervisorApplication.isActive();
    }
}
