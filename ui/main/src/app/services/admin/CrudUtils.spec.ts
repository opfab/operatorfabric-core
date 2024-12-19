/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {EntitiesServerMock} from '@tests/mocks/entitiesServer.mock';
import {Entity} from 'app/services/entities/model/Entity';
import {firstValueFrom} from 'rxjs';
import {CrudUtilities} from './CrudUtils';
import {MultiSelectOption} from '@ofModel/multiselect.model';
import {EntitiesService} from '@ofServices/entities/EntitiesService';

describe('Entities multiselect options labels ', () => {
    let entityServerMock: EntitiesServerMock;

    beforeEach(async () => {
        await initEntityService();
    });

    afterEach(() => {
        jasmine.clock().uninstall();
    });

    async function initEntityService() {
        entityServerMock = new EntitiesServerMock();
        entityServerMock.setEntities([
            new Entity('entity1', 'ENTITY1 NAME', null, null, null, null),
            new Entity('entity2', 'ENTITY2 NAME', null, null, null, null),
            new Entity('entity3', 'ENTITY3 NAME', null, null, null, null),
            new Entity('entity4', 'ENTITY1 NAME', null, null, null, null)
        ]);
        EntitiesService.setEntitiesServer(entityServerMock);
        await firstValueFrom(EntitiesService.loadAllEntitiesData());
    }

    it('GIVEN an entity with a duplicated name THEN the multiselect option should contain the entity name and the id ', async () => {
        let option = new MultiSelectOption('entity4', 'ENTITY1 NAME');
        expect(CrudUtilities.entityLabelRenderer(option)).toEqual(
            'ENTITY1 NAME <i style="color: var(--opfab-color-grey);text-overflow: ellipsis">(entity4)</i>'
        );

        option = new MultiSelectOption('entity1', 'ENTITY1 NAME');
        expect(CrudUtilities.entityLabelRenderer(option)).toEqual(
            'ENTITY1 NAME <i style="color: var(--opfab-color-grey);text-overflow: ellipsis">(entity1)</i>'
        );
    });

    it('GIVEN an entity with a unique name THEN the multiselect option should equal the entity name', async () => {
        const option = new MultiSelectOption('entity2', 'ENTITY2 NAME');
        expect(CrudUtilities.entityLabelRenderer(option)).toEqual('ENTITY2 NAME');
    });
});
