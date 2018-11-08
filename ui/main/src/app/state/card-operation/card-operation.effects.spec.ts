/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed, inject } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';

import { CardOperationEffects } from './card-operation.effects';

describe('CardOperationEffects', () => {
  let actions$: Observable<any>;
  let effects: CardOperationEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CardOperationEffects,
        provideMockActions(() => actions$)
      ]
    });

    effects = TestBed.get(CardOperationEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});
