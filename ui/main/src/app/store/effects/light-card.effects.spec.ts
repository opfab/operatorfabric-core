/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {LightCardEffects} from './light-card.effects';
import {getSeveralRandomLightCards} from '../../../tests/helpers';
import {Actions} from '@ngrx/effects';
import {LoadLightCards, LoadLightCardsSuccess} from '@ofActions/light-card.actions';
import {hot} from 'jasmine-marbles';

describe('LightCardEffects', () => {
    let effects: LightCardEffects;

    it('should return a LoadLightCardsSuccess when the cardService serve an array of Light Card', () => {
        const expectedArrayOfLightCards = getSeveralRandomLightCards(3);

        const localActions$ = new Actions(hot('-a--', {a: new LoadLightCards()}));

        const localMockCardService = jasmine.createSpyObj('CardService', ['getLightCards']);

        localMockCardService.getLightCards.and.returnValue(hot('---b', {b: expectedArrayOfLightCards}));
        const expectedAction = new LoadLightCardsSuccess({lightCards: expectedArrayOfLightCards});
        const localExpected = hot('---c', {c: expectedAction});

        effects = new LightCardEffects(localActions$, localMockCardService);

        expect(effects).toBeTruthy();
        expect(effects.load).toBeObservable(localExpected);
    });





});
