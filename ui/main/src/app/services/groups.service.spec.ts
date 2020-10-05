/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import { TestBed } from '@angular/core/testing';
import { GroupsService } from './groups.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';


describe('GroupsService', () => {
  let service: GroupsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GroupsService],
      imports:[  HttpClientTestingModule],

  });
  httpMock = TestBed.get(HttpTestingController);
  service = TestBed.get(GroupsService);
  });
  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
