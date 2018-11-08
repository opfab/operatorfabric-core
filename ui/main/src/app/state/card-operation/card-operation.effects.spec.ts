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
