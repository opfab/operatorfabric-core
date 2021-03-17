/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {Actions} from '@ngrx/effects';
import {hot} from 'jasmine-marbles';
import {Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import {CardOperationEffects} from '@ofEffects/card-operation.effects';
import {LoadLightCardsSuccess} from '@ofActions/light-card.actions';
import {getOneRandomLightCard, getRandomIndex, getSeveralRandomLightCards} from '@tests/helpers';
import {CardService} from '@ofServices/card.service';
import {LoadCard} from '@ofActions/card.actions';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {provideMockActions} from '@ngrx/effects/testing';
import {Observable} from 'rxjs';
import {TestBed, waitForAsync} from '@angular/core/testing';
import {SoundNotificationService} from "@ofServices/sound-notification.service";
import {feedInitialState} from "@ofStates/feed.state";
import SpyObj = jasmine.SpyObj;

describe('CardOperationEffects', () => {
    let actions$: Observable<any>;
    let effects: CardOperationEffects;
    let cardServiceSpy: SpyObj<CardService>;
    let soundNotificationServiceSpy: SpyObj<SoundNotificationService>;
    let store: MockStore<AppState>;

    const initialState = {
        card: {
            selected: null,
            loading: false,
            error: null
        },
    } as AppState;

    beforeEach(waitForAsync(() => {
        cardServiceSpy = jasmine.createSpyObj('CardService', ['loadCard']);
        soundNotificationServiceSpy = jasmine.createSpyObj('SoundNotificationService',['handleCards']);
        TestBed.configureTestingModule({
            providers: [
                CardOperationEffects,
                provideMockStore({ initialState }),
                provideMockActions(() => actions$),
                {provide: CardService, useValue: cardServiceSpy},
                {provide: SoundNotificationService, useValue: soundNotificationServiceSpy}
            ],
        });


        store = TestBed.inject(Store) as MockStore<AppState>;
        effects = TestBed.inject(CardOperationEffects);
    }));

    describe( 'refreshIfSelectedCard', () => {

        it('should trigger LoadCard on LoadLightCardSuccess if selected card is among updated cards', () => {

            const severalRandomLightCards = getSeveralRandomLightCards(5);
            const selectedLightCard = severalRandomLightCards[getRandomIndex(severalRandomLightCards)];

            store.setState({
                ...initialState,
                card: {
                    selected: selectedLightCard,
                    selectedChildCards: [],
                    loading: false,
                    error: null
                }
            });

            const localActions$ = new Actions(hot('-a-', {a: new LoadLightCardsSuccess({lightCards: severalRandomLightCards})}));

            const expectedAction = new LoadCard({id: selectedLightCard.id});
            // const localExpected = hot('--b', {b: expectedAction});

            const localExpected = hot('-b-', {b: expectedAction});

            effects = new CardOperationEffects(store, localActions$, cardServiceSpy, soundNotificationServiceSpy);

            expect(effects).toBeTruthy();
            expect(effects.refreshIfSelectedCard).toBeObservable(localExpected);

        });

        it( 'should not trigger LoadCard on LoadLightCardSuccess if selected card is not among updated cards', () =>{

            const severalRandomLightCards = getSeveralRandomLightCards(5);
            const selectedLightCard = getOneRandomLightCard();

            store.setState({
                ...initialState,
                card: {
                    selected: selectedLightCard,
                    selectedChildCards: [],
                    loading: false,
                    error: null
                }
            });

            const localActions$ = new Actions(hot('-a-', {a: new LoadLightCardsSuccess({lightCards: severalRandomLightCards})}));

            effects = new CardOperationEffects(store, localActions$, cardServiceSpy, soundNotificationServiceSpy);

            expect(effects).toBeTruthy();
            effects.refreshIfSelectedCard.subscribe( x => fail('Unexpected action emitted.'));

        });

    });

    describe( 'triggerSoundNotifications', () => {

        it('should call notification service when LoadLightCardSuccess is fired', () => {

            const severalRandomLightCards = getSeveralRandomLightCards(5);

            store.setState({
                ...initialState,
                feed: feedInitialState
            });

            const localActions$ = new Actions(hot('-a-', {a: new LoadLightCardsSuccess({lightCards: severalRandomLightCards})}));
            effects = new CardOperationEffects(store, localActions$, cardServiceSpy, soundNotificationServiceSpy);
            expect(effects).toBeTruthy();
            effects.triggerSoundNotifications.subscribe(() => {
                expect(soundNotificationServiceSpy.handleCards).toHaveBeenCalledTimes(1);
            });

        });

    });
});
