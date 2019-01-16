/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {CardEffects} from './card.effects';
import {getOneRandomCard} from '@tests/helpers';
import {Actions} from '@ngrx/effects';
import {hot} from 'jasmine-marbles';
import {LoadCard, LoadCardSuccess} from "@ofActions/card.actions";

describe('CardEffects', () => {
    let effects: CardEffects;

    it('should return a LoadLightCardsSuccess when the cardService serve an array of Light Card', () => {
        const expectedCard =  getOneRandomCard();

        const localActions$ = new Actions(hot('-a--', {a: new LoadCard({id:"123"})}));

        const localMockCardService = jasmine.createSpyObj('CardService', ['loadCard']);

        const mockStore = jasmine.createSpyObj('Store',['dispatch']);

        localMockCardService.loadCard.and.returnValue(hot('---b', {b: expectedCard}));
        const expectedAction = new LoadCardSuccess({card: expectedCard});
        const localExpected = hot('---c', {c: expectedAction});

        effects = new CardEffects(mockStore, localActions$, localMockCardService);

        expect(effects).toBeTruthy();
        expect(effects.loadById).toBeObservable(localExpected);
    });





});
