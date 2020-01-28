/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


import {Actions} from '@ngrx/effects';
import {hot} from 'jasmine-marbles';
import {Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import {CardOperationEffects} from '@ofEffects/card-operation.effects';
import {LoadLightCardsSuccess} from '@ofActions/light-card.actions';
import {getOneRandomLigthCard, getRandomIndex, getSeveralRandomLightCards} from '@tests/helpers';
import {CardService} from '@ofServices/card.service';
import {LoadCard} from '@ofActions/card.actions';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {provideMockActions} from '@ngrx/effects/testing';
import {Observable} from 'rxjs';
import {async, TestBed} from '@angular/core/testing';
import SpyObj = jasmine.SpyObj;

describe('CardOperationEffects', () => {
    let actions$: Observable<any>;
    let effects: CardOperationEffects;
    let cardServiceSpy: SpyObj<CardService>;
    let store: MockStore<AppState>;

    const initialState = {
        card: {
            selected: null,
            loading: false,
            error: null
        },
    } as AppState;

    beforeEach(async(() => {
        cardServiceSpy = jasmine.createSpyObj('CardService', ['loadCard']);
        TestBed.configureTestingModule({
            providers: [
                CardOperationEffects,
                provideMockStore({ initialState }),
                provideMockActions(() => actions$),
                {provide: CardService, useValue: cardServiceSpy}
            ],
        });

        store = TestBed.get(Store);
        effects = TestBed.get(CardOperationEffects);
    }));

    describe( 'refreshIfSelectedCard', () => {

        it('should trigger LoadCard on LoadLightCardSuccess if selected card is among updated cards', () => {

            const severalRandomLightCards = getSeveralRandomLightCards(5);
            const selectedLightCard = severalRandomLightCards[getRandomIndex(severalRandomLightCards)];

            store.setState({
                ...initialState,
                card: {
                    selected: selectedLightCard,
                    loading: false,
                    error: null,
                    actionsAppear: []
                }
            });

            const localActions$ = new Actions(hot('-a-', {a: new LoadLightCardsSuccess({lightCards: severalRandomLightCards})}));

            const expectedAction = new LoadCard({id: selectedLightCard.id});
            // const localExpected = hot('--b', {b: expectedAction});

            const localExpected = hot('-b-', {b: expectedAction});

            effects = new CardOperationEffects(store, localActions$, cardServiceSpy);

            expect(effects).toBeTruthy();
            expect(effects.refreshIfSelectedCard).toBeObservable(localExpected);

        });

        it( 'should not trigger LoadCard on LoadLightCardSuccess if selected card is not among updated cards', () =>{

            const severalRandomLightCards = getSeveralRandomLightCards(5);
            const selectedLightCard = getOneRandomLigthCard();

            store.setState({
                ...initialState,
                card: {
                    selected: selectedLightCard,
                    loading: false,
                    error: null,
                    actionsAppear: []
                }
            });

            const localActions$ = new Actions(hot('-a-', {a: new LoadLightCardsSuccess({lightCards: severalRandomLightCards})}));

            effects = new CardOperationEffects(store, localActions$, cardServiceSpy);

            expect(effects).toBeTruthy();
            effects.refreshIfSelectedCard.subscribe( x => fail('Unexpected action emitted.'));

        });

    });
});
