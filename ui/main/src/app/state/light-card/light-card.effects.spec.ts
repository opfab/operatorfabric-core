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
