/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
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
  it('should be created', () => {
    expect(entitiesService).toBeTruthy();
  });
  describe('#getAllEntities', () => {
    it('should return an Observable<Entity[]>', () => {
      const listEntities: Entity[] = [];
      const entity1 = new Entity('ENTITY1', 'Control Room 1', 'Control Room 1');
      const entity2 = new Entity('ENTITY2', 'Control Room 2', 'Control Room 2');
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
})
