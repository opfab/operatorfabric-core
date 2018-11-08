/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed, inject } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';

import { LightCardEffects } from './light-card.effects';

describe('LightCardEffects', () => {
  let actions$: Observable<any>;
  let effects: LightCardEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LightCardEffects,
        provideMockActions(() => actions$)
      ]
    });

    effects = TestBed.get(LightCardEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});
