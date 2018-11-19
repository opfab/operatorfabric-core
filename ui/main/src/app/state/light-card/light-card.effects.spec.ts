/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {TestBed} from '@angular/core/testing';
import {provideMockActions} from '@ngrx/effects/testing';
import {Observable, of} from 'rxjs';

import {LightCardEffects} from './light-card.effects';
import {getOneRandomLigthCard, getSeveralRandomLightCards} from '@tests/helpers';
import {Actions} from '@ngrx/effects';
import {LoadLightCardsSuccess} from '@state/light-card/light-card.actions';
import {LightCard} from '@state/light-card/light-card.model';

xdescribe('LightCardEffects', () => {
    let actions$: Observable<any>;
    // let lightCards$: Observable<LightCard[]>;

    let effects: LightCardEffects;

    const oneCard = getOneRandomLigthCard();

    const mockCardService = {getLightCards: () => of([oneCard])};

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                LightCardEffects,
                provideMockActions(() => actions$),
                // provideMockActions(() => lightCards$)
            ]
        });

        effects = TestBed.get(LightCardEffects);
        actions$ = TestBed.get(Actions);
        // lightCards$ = TestBed.get(LightCard[]);
    });

    it('should be created', () => {
        expect(effects).toBeTruthy();
    });

    it('should return a LoadLightCardsSuccess on success', () => {
        const lightCards = getSeveralRandomLightCards( 2);
        const fromCardService = lightCards;
        const action = new LoadLightCardsSuccess({lightCards: lightCards});

        expect(effects).toBeTruthy();
    });

    it('should return a LoadLightCardsFailure when service throw an error', () => {
        expect(effects).toBeTruthy();
    });


});
