

import {CardEffects} from './card.effects';
import {getOneRandomCard} from '@tests/helpers';
import {Actions} from '@ngrx/effects';
import {hot} from 'jasmine-marbles';
import {LoadCard, LoadCardSuccess, ClearCard} from "@ofActions/card.actions";
import { ClearLightCardSelection } from '@ofStore/actions/light-card.actions';

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
    it('should cleat the card selection', () => {
        const mockStore = jasmine.createSpyObj('Store', ['dispatch']);
        const localMockCardService = jasmine.createSpyObj('CardService', ['loadCard']);
        const clearAction$ = new Actions(hot('--a', {a: new ClearLightCardSelection()}));
        const expectedClearAction = new ClearCard();
        const localClearExpected = hot('--c', {c: expectedClearAction});
        effects = new CardEffects(mockStore, clearAction$, localMockCardService);
        expect(effects).toBeTruthy();
        expect(effects.clearCardSelection).toBeObservable(localClearExpected);
    });

});
