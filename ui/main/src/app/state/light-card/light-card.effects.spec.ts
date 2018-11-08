/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {TestBed, inject} from '@angular/core/testing';
import {provideMockActions} from '@ngrx/effects/testing';
import {Observable, of} from 'rxjs';

import {LightCardEffects} from './light-card.effects';
import {I18nData, LightCard, Severity} from '@state/light-card/light-card.model';
import {CardService} from '@core/services/card.service';

describe('LightCardEffects', () => {
    let actions$: Observable<any>;

    let effects: LightCardEffects;

    const title = new I18nData('title-key', ['title-string-0']);
    const summary = new I18nData('summary-key', ['summary-string-0']);
    const oneCard = new LightCard('uid'
        , 'id'
        , 1
        , 2
        , Severity.QUESTION
        , 'mainRecipient'
        , 'processId'
        , 3
        , title
        , summary
    );

    const mockCardService = {getLightCards: () => of([oneCard])};

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                LightCardEffects,
                provideMockActions(() => actions$),
                {provide: CardService, useValue: mockCardService}
            ]
        });

        effects = TestBed.get(LightCardEffects);
    });

    it('should be created', () => {
        expect(effects).toBeTruthy();
    });
});
