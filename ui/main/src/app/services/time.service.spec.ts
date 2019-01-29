/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {TestBed} from '@angular/core/testing';

import {TimeService} from './time.service';

describe('TimeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    TestBed.configureTestingModule({
        providers: [
            TimeService
        ]
    })
    const service: TimeService = TestBed.get(TimeService);
    expect(service).toBeTruthy();
  });
});
