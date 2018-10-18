/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { TestBed, inject } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';

import { CardEffects } from './card.effects';

describe('CardEffects', () => {
  let actions$: Observable<any>;
  let effects: CardEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CardEffects,
        provideMockActions(() => actions$)
      ]
    });

    effects = TestBed.get(CardEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});
