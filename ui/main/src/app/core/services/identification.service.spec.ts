/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {inject, TestBed} from '@angular/core/testing';

import {IdentificationService} from './identification.service';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';

describe('IdentificationService', () => {

  let httpMock: HttpTestingController;

  beforeEach(() => {

    TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
      providers: [IdentificationService]
    });
    httpMock = TestBed.get(HttpTestingController);
  });

  it('should be created', inject([IdentificationService], (service: IdentificationService) => {
    expect(service).toBeTruthy();
  }));
});
