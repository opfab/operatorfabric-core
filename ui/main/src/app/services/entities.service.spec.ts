/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../environments/environment';
import { EntitiesService } from '@ofServices/entities.service';
import { StoreModule } from '@ngrx/store';
import { appReducer } from '@ofStore/index';
import { Entity } from '../model/entity.model';

describe('EntitiesService', () => {
  let httpMock: HttpTestingController;
  let entitiesService: EntitiesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EntitiesService],
      imports: [HttpClientTestingModule,
        StoreModule.forRoot(appReducer)
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
    entitiesService = TestBed.inject(EntitiesService);
  });
  afterEach(() => {
    httpMock.verify();
  });

  describe('#getAllEntities', () => {
    it('should return an Observable<Entity[]>', () => {
      const listEntities: Entity[] = [];
      const entity1 = new Entity('ENTITY1', 'Control Room 1', 'Control Room 1', true, []);
      const entity2 = new Entity('ENTITY2', 'Control Room 2', 'Control Room 2', true, []);
      listEntities.push(entity1);
      listEntities.push(entity2);
      entitiesService.getAllEntities().subscribe(result => {
        expect(result.length).toBe(2);
        expect(result[0].id).toBe('ENTITY1');
        expect(result[1].id).toBe('ENTITY2');
      });
      const req = httpMock.expectOne(`${environment.urls.entities}`);
      expect(req.request.method).toBe('GET');
      req.flush(listEntities);
    });
  });
  

  describe('#getEntitiesAllowedToRespond', () => {
    it('shoud return 3 entities', () => {
      const listEntities: Entity[] = [];
      const entity1 = new Entity('ENTITY1', 'Control Room 1', 'Control Room 1', true, []);
      const entity2 = new Entity('ENTITY2', 'Control Room 2', 'Control Room 2', true, []);
      const entity3 = new Entity('ENTITY3', 'Control Room 3', 'Control Room 3', false, []);
      const entity3_1 = new Entity('ENTITY3.1', 'Control Room 3.1', 'Control Room 3.1', false, ['ENTITY3']);
      const entity3_1_1 = new Entity('ENTITY3.1.1', 'Control Room 3.1.1', 'Control Room 3.1.1', false, ['ENTITY3.1']);
      const entity3_1_2 = new Entity('ENTITY3.1.2', 'Control Room 3.1.2', 'Control Room 3.1.2', true, ['ENTITY3.1']);
      const entity3_2 = new Entity('ENTITY3.2', 'Control Room 3.2', 'Control Room 3.2', true, ['ENTITY3']);

      listEntities.push(entity1);
      listEntities.push(entity2);
      listEntities.push(entity3);
      listEntities.push(entity3_1);
      listEntities.push(entity3_1_1);
      listEntities.push(entity3_1_2);
      listEntities.push(entity3_2);

      entitiesService.loadAllEntitiesData().subscribe(result => {
        expect(result.length).toBe(7);
        const selectedEntities: Entity[] = [];
        selectedEntities.push(entity2);
        selectedEntities.push(entity3);
        const allowedEntities = entitiesService.resolveEntitiesAllowedToSendCards(selectedEntities);
        expect(allowedEntities.length).toBe(3);
        expect(allowedEntities[0].id).toBe('ENTITY2');
        expect(allowedEntities[1].id).toBe('ENTITY3.1.2');
        expect(allowedEntities[2].id).toBe('ENTITY3.2');
      });
      const req = httpMock.expectOne(`${environment.urls.entities}`);
      expect(req.request.method).toBe('GET');
      req.flush(listEntities);

    });

    it('shoud return 1 entity', () => {
      const listEntities: Entity[] = [];

      const entityGroup = new Entity('ENTITYGROUP', 'Control Rooms', 'Control Rooms', true, []);
      const entity1 = new Entity('ENTITY1', 'Control Room 1', 'Control Room 1', true, ['ENTITYGROUP']);
      const entity2 = new Entity('ENTITY2', 'Control Room 2', 'Control Room 2', true, ['ENTITYGROUP']);

      listEntities.push(entity1);
      listEntities.push(entity2);
      listEntities.push(entityGroup);

      entitiesService.loadAllEntitiesData().subscribe(result => {
        expect(result.length).toBe(3);
        const selectedEntities: Entity[] = [];
        selectedEntities.push(entityGroup);

        const allowedEntities = entitiesService.resolveEntitiesAllowedToSendCards(selectedEntities);
        expect(allowedEntities.length).toBe(1);
        expect(allowedEntities[0].id).toBe('ENTITYGROUP');
      });
      const req = httpMock.expectOne(`${environment.urls.entities}`);
      expect(req.request.method).toBe('GET');
      req.flush(listEntities);

    });

    it('shoud return 2 entity', () => {
      const listEntities: Entity[] = [];
  
      const entityGroup = new Entity('ENTITYGROUP', 'Control Rooms', 'Control Rooms', false, []);
      const entity1 = new Entity('ENTITY1', 'Control Room 1', 'Control Room 1', true, ['ENTITYGROUP']);
      const entity2 = new Entity('ENTITY2', 'Control Room 2', 'Control Room 2', true, ['ENTITYGROUP']);
  
      listEntities.push(entity1);
      listEntities.push(entity2);
      listEntities.push(entityGroup);

      entitiesService.loadAllEntitiesData().subscribe(result => {
        expect(result.length).toBe(3);
        const selectedEntities: Entity[] = [];
        selectedEntities.push(entity1);
        selectedEntities.push(entity2);
        selectedEntities.push(entityGroup);
  
        const allowedEntities = entitiesService.resolveEntitiesAllowedToSendCards(selectedEntities);
        expect(allowedEntities.length).toBe(2);
        expect(allowedEntities[0].id).toBe('ENTITY1');
        expect(allowedEntities[1].id).toBe('ENTITY2');
      });
      const req = httpMock.expectOne(`${environment.urls.entities}`);
      expect(req.request.method).toBe('GET');
      req.flush(listEntities);
  
    });
  });

})
