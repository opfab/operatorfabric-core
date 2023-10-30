/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {TestBed} from '@angular/core/testing';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {environment} from '../../../../environments/environment';
import {EntitiesService} from 'app/business/services/users/entities.service';
import {Entity} from '@ofModel/entity.model';
import {RemoteLoggerServer} from 'app/business/server/remote-logger.server';
import {AngularEntitiesServer} from 'app/server/angularEntities.server';

describe('EntitiesService', () => {
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                {provide: RemoteLoggerServer, useValue: null}
            ],
            imports: [HttpClientTestingModule]
        });
        httpMock = TestBed.inject(HttpTestingController);
        EntitiesService.setEntitiesServer(TestBed.inject(AngularEntitiesServer));
    });
    afterEach(() => {
        httpMock.verify();
    });

    describe('#queryAllEntities', () => {
        it('should return an Observable<Entity[]>', () => {
            const listEntities: Entity[] = [];
            const entity1 = new Entity('ENTITY1', 'Control Room 1', 'Control Room 1', true, [], []);
            const entity2 = new Entity('ENTITY2', 'Control Room 2', 'Control Room 2', true, [], []);
            listEntities.push(entity1);
            listEntities.push(entity2);
            EntitiesService.queryAllEntities().subscribe((result) => {
                expect(result.length).toBe(2);
                expect(result[0].id).toBe('ENTITY1');
                expect(result[1].id).toBe('ENTITY2');
            });
            const req = httpMock.expectOne(`${environment.url}/users/entities`);
            expect(req.request.method).toBe('GET');
            req.flush(listEntities);
        });
    });

    describe('#getEntitiesAllowedToRespond', () => {
        it('should return 3 entities', () => {
            const listEntities: Entity[] = [];
            const entity1 = new Entity('ENTITY1', 'Control Room 1', 'Control Room 1', true, [], []);
            const entity2 = new Entity('ENTITY2', 'Control Room 2', 'Control Room 2', true, [], []);
            const entity3 = new Entity('ENTITY3', 'Control Room 3', 'Control Room 3', false, [], []);
            const entity3_1 = new Entity('ENTITY3.1', 'Control Room 3.1', 'Control Room 3.1', false, [], ['ENTITY3']);
            const entity3_1_1 = new Entity(
                'ENTITY3.1.1',
                'Control Room 3.1.1',
                'Control Room 3.1.1',
                false,
                [],
                ['ENTITY3.1']
            );
            const entity3_1_2 = new Entity(
                'ENTITY3.1.2',
                'Control Room 3.1.2',
                'Control Room 3.1.2',
                true,
                [],
                ['ENTITY3.1']
            );
            const entity3_2 = new Entity('ENTITY3.2', 'Control Room 3.2', 'Control Room 3.2', true, [], ['ENTITY3']);

            listEntities.push(entity1);
            listEntities.push(entity2);
            listEntities.push(entity3);
            listEntities.push(entity3_1);
            listEntities.push(entity3_1_1);
            listEntities.push(entity3_1_2);
            listEntities.push(entity3_2);

            EntitiesService.loadAllEntitiesData().subscribe((result) => {
                expect(result.length).toBe(7);
                const selectedEntities: Entity[] = [];
                selectedEntities.push(entity2);
                selectedEntities.push(entity3);
                const allowedEntities = EntitiesService.resolveEntitiesAllowedToSendCards(selectedEntities);
                expect(allowedEntities.length).toBe(3);
                expect(allowedEntities[0].id).toBe('ENTITY2');
                expect(allowedEntities[1].id).toBe('ENTITY3.1.2');
                expect(allowedEntities[2].id).toBe('ENTITY3.2');
            });
            const req = httpMock.expectOne(`${environment.url}/users/entities`);
            expect(req.request.method).toBe('GET');
            req.flush(listEntities);
        });

        it('should return 1 entity', () => {
            const listEntities: Entity[] = [];

            const entityGroup = new Entity('ENTITYGROUP', 'Control Rooms', 'Control Rooms', true, [], []);
            const entity1 = new Entity('ENTITY1', 'Control Room 1', 'Control Room 1', true, [], ['ENTITYGROUP']);
            const entity2 = new Entity('ENTITY2', 'Control Room 2', 'Control Room 2', true, [], ['ENTITYGROUP']);

            listEntities.push(entity1);
            listEntities.push(entity2);
            listEntities.push(entityGroup);

            EntitiesService.loadAllEntitiesData().subscribe((result) => {
                expect(result.length).toBe(3);
                const selectedEntities: Entity[] = [];
                selectedEntities.push(entityGroup);

                const allowedEntities = EntitiesService.resolveEntitiesAllowedToSendCards(selectedEntities);
                expect(allowedEntities.length).toBe(1);
                expect(allowedEntities[0].id).toBe('ENTITYGROUP');
            });
            const req = httpMock.expectOne(`${environment.url}/users/entities`);
            expect(req.request.method).toBe('GET');
            req.flush(listEntities);
        });

        it('should return 2 entities', () => {
            const listEntities: Entity[] = [];

            const entityGroup = new Entity('ENTITYGROUP', 'Control Rooms', 'Control Rooms', false, [], []);
            const entity1 = new Entity('ENTITY1', 'Control Room 1', 'Control Room 1', true, [], ['ENTITYGROUP']);
            const entity2 = new Entity('ENTITY2', 'Control Room 2', 'Control Room 2', true, [], ['ENTITYGROUP']);

            listEntities.push(entity1);
            listEntities.push(entity2);
            listEntities.push(entityGroup);

            EntitiesService.loadAllEntitiesData().subscribe((result) => {
                expect(result.length).toBe(3);
                const selectedEntities: Entity[] = [];
                selectedEntities.push(entity1);
                selectedEntities.push(entity2);
                selectedEntities.push(entityGroup);

                const allowedEntities = EntitiesService.resolveEntitiesAllowedToSendCards(selectedEntities);
                expect(allowedEntities.length).toBe(2);
                expect(allowedEntities[0].id).toBe('ENTITY1');
                expect(allowedEntities[1].id).toBe('ENTITY2');
            });
            const req = httpMock.expectOne(`${environment.url}/users/entities`);
            expect(req.request.method).toBe('GET');
            req.flush(listEntities);
        });
    });

    describe('#resolveChildEntitiesByLevel', () => {
        it('should return the child entities with the specified connection level', () => {
            const listEntities: Entity[] = [];
            const entity1 = new Entity('ENTITY1', 'Control Room 1', 'Control Room 1', true, [], []);
            const entity2 = new Entity('ENTITY2', 'Control Room 2', 'Control Room 2', true, [], []);
            const entity3 = new Entity('ENTITY3', 'Control Room 3', 'Control Room 3', false, [], []);
            const entity3_1 = new Entity('ENTITY3.1', 'Control Room 3.1', 'Control Room 3.1', false, [], ['ENTITY3']);
            const entity3_1_1 = new Entity(
                'ENTITY3.1.1',
                'Control Room 3.1.1',
                'Control Room 3.1.1',
                false,
                [],
                ['ENTITY3.1']
            );
            const entity3_1_2 = new Entity(
                'ENTITY3.1.2',
                'Control Room 3.1.2',
                'Control Room 3.1.2',
                true,
                [],
                ['ENTITY3.1']
            );
            const entity3_2 = new Entity('ENTITY3.2', 'Control Room 3.2', 'Control Room 3.2', true, [], ['ENTITY3']);

            listEntities.push(entity1);
            listEntities.push(entity2);
            listEntities.push(entity3);
            listEntities.push(entity3_1);
            listEntities.push(entity3_1_1);
            listEntities.push(entity3_1_2);
            listEntities.push(entity3_2);

            EntitiesService.loadAllEntitiesData().subscribe((result) => {
                expect(result.length).toBe(7);
                const allowedEntities = EntitiesService.resolveChildEntitiesByLevel('ENTITY1', 0);
                expect(allowedEntities.length).toBe(1);
                expect(allowedEntities[0].id).toBe('ENTITY1');

                const allowedEntities1 = EntitiesService.resolveChildEntitiesByLevel('ENTITY3', 1);
                expect(allowedEntities1.length).toBe(2);
                expect(allowedEntities1[0].id).toBe('ENTITY3.1');
                expect(allowedEntities1[1].id).toBe('ENTITY3.2');

                const allowedEntities2 = EntitiesService.resolveChildEntitiesByLevel('ENTITY3', 2);
                expect(allowedEntities2.length).toBe(2);
                expect(allowedEntities2[0].id).toBe('ENTITY3.1.1');
                expect(allowedEntities2[1].id).toBe('ENTITY3.1.2');

                const allowedEntities3 = EntitiesService.resolveChildEntitiesByLevel('ENTITY2', 1);
                expect(allowedEntities3.length).toBe(0);

                const allowedEntities4 = EntitiesService.resolveChildEntitiesByLevel('ENTITY2', 2);
                expect(allowedEntities4.length).toBe(0);
            });
            const req = httpMock.expectOne(`${environment.url}/users/entities`);
            expect(req.request.method).toBe('GET');
            req.flush(listEntities);
        });
    });

    describe('#resolveChildEntities', () => {
        it('should return all the child and sub child entities', () => {
            const listEntities: Entity[] = [];
            const entity1 = new Entity('ENTITY1', 'Control Room 1', 'Control Room 1', true, [], []);
            const entity2 = new Entity('ENTITY2', 'Control Room 2', 'Control Room 2', true, [], []);
            const entity2_1 = new Entity('ENTITY2.1', 'Control Room 2.1', 'Control Room 2.1', true, [], ['ENTITY2']);

            const entity3 = new Entity('ENTITY3', 'Control Room 3', 'Control Room 3', false, [], []);
            const entity3_1 = new Entity('ENTITY3.1', 'Control Room 3.1', 'Control Room 3.1', false, [], ['ENTITY3']);
            const entity3_1_1 = new Entity(
                'ENTITY3.1.1',
                'Control Room 3.1.1',
                'Control Room 3.1.1',
                false,
                [],
                ['ENTITY3.1']
            );
            const entity3_1_2 = new Entity(
                'ENTITY3.1.2',
                'Control Room 3.1.2',
                'Control Room 3.1.2',
                true,
                [],
                ['ENTITY3.1']
            );
            const entity3_2 = new Entity('ENTITY3.2', 'Control Room 3.2', 'Control Room 3.2', true, [], ['ENTITY3']);

            listEntities.push(entity1);
            listEntities.push(entity2);
            listEntities.push(entity2_1);
            listEntities.push(entity3);
            listEntities.push(entity3_1);
            listEntities.push(entity3_1_1);
            listEntities.push(entity3_1_2);
            listEntities.push(entity3_2);

            EntitiesService.loadAllEntitiesData().subscribe((result) => {
                expect(result.length).toBe(8);
                const allowedEntities = EntitiesService.resolveChildEntities('ENTITY1');
                expect(allowedEntities.length).toBe(0);

                const allowedEntities2 = EntitiesService.resolveChildEntities('ENTITY2');
                expect(allowedEntities2.length).toBe(1);
                expect(allowedEntities2[0].id).toBe('ENTITY2.1');

                const allowedEntities3 = EntitiesService.resolveChildEntities('ENTITY3');
                expect(allowedEntities3.length).toBe(4);
                expect(allowedEntities3[0].id).toBe('ENTITY3.1');
                expect(allowedEntities3[1].id).toBe('ENTITY3.1.1');
                expect(allowedEntities3[2].id).toBe('ENTITY3.1.2');
                expect(allowedEntities3[3].id).toBe('ENTITY3.2');
            });
            const req = httpMock.expectOne(`${environment.url}/users/entities`);
            expect(req.request.method).toBe('GET');
            req.flush(listEntities);
        });
    });
});
