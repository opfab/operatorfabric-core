/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import SupervisorDatabaseServer from '../../domain/server-side/supervisorDatabaseServer';

export class SupervisorDatabaseServerStub implements SupervisorDatabaseServer {
    public async openConnection(): Promise<void> {
        // Do nothing, just needed to stub
    }

    //eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async getSupervisedEntity(id: string): Promise<any> {
        throw new Error('Method not implemented.');
    }

    public supervisedEntities: any[] = [];

    public async getSupervisedEntities(): Promise<any[]> {
        const supervised: any[] = [];
        this.supervisedEntities.forEach((entity) => supervised.push(entity));
        return supervised;
    }

    public async saveSupervisedEntity(supervisedEntity: any): Promise<void> {
        const index = this.supervisedEntities.findIndex((entity) => entity.entityId === supervisedEntity.entityId);
        if (index >= 0) {
            this.supervisedEntities.splice(index, 1);
        }
        this.supervisedEntities.push(supervisedEntity);
    }

    public async deleteSupervisedEntity(id: string): Promise<void> {
        const index = this.supervisedEntities.findIndex((entity) => entity.entityId === id);
        if (index >= 0) {
            this.supervisedEntities.splice(index, 1);
        }
    }
}
