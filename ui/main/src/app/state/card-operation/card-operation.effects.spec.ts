/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {Observable} from 'rxjs';
import {async, TestBed} from '@angular/core/testing';
import {provideMockActions} from '@ngrx/effects/testing';
import {Actions} from '@ngrx/effects';
import {CardOperationEffects} from './card-operation.effects';
import {CardService} from '@core/services/card.service';
import {cold, hot} from 'jasmine-marbles';
import {getOneRandomAddCardOperation} from '@tests/helpers';
import {AddLightCardFailure, LoadLightCardsSuccess} from '@state/light-card/light-card.actions';
import {AcceptLogIn} from '@state/authentication/authentication.actions';
import SpyObj = jasmine.SpyObj;
import createSpyObj = jasmine.createSpyObj;

describe('CardOperationEffects', () => {
    let actions$: Observable<any>;
    let effects: CardOperationEffects;
    let cardService: SpyObj<CardService>;

    beforeEach(async(() => {
        const cardServiceSpy = createSpyObj('cardService', ['testCardOperation']);
        TestBed.configureTestingModule({
            providers: [
                CardOperationEffects,
                provideMockActions(() => actions$),
                {provide: CardService, useValue: cardServiceSpy}
            ]
        });
    }));

    beforeEach(() => {
        actions$ = TestBed.get(Actions);
        cardService = TestBed.get(CardService);
        // need to emit an action of accepted login before calling Card Service
        actions$ = hot('a---', {a: new AcceptLogIn({
                identifier: 'st', token: 'rue', expirationDate: new Date()})}
        );
    });

    it('should be created', () => {
        const cardOperation = getOneRandomAddCardOperation();
        const cardOperations$ = cold('--a-', {a: cardOperation});
        cardService.testCardOperation.and.returnValue(cardOperations$);
        effects = TestBed.get(CardOperationEffects);
        expect(effects).toBeTruthy();
    });

    it('should emit LoadLightCardSuccess when add card operation emitted by the service', () => {
        // prepare the payload and extract its content for verification
        const cardOperation = getOneRandomAddCardOperation();
        const lightCards = cardOperation.cards;
        const actionPayload = {lightCards: lightCards};

        // mock the observable behavior of the card service and the expected Action observable from the effect
        const expectedAction = new LoadLightCardsSuccess(actionPayload);
        const cardOperations$ = cold('---b-', {b: cardOperation});
        const expected$ = cold('---c-', {c: expectedAction});

        // programs the service consume by the effect
        cardService.testCardOperation.and.returnValue(cardOperations$);

        // instantiate the tested effects
        effects = TestBed.get(CardOperationEffects);

        expect(effects).toBeTruthy();
        expect(effects.getCardOperations).toBeObservable(expected$);
    });

    it('should emit AddLightCardFailure when the service emit an error', () => {

        const cardOperations$ = cold('--#', null, new Error('error'));

        const expectedActions$ = cold('--a',
            {a: new AddLightCardFailure({error: new Error('error')})}
        );
        cardService.testCardOperation.and.returnValue(cardOperations$);
        effects = TestBed.get(CardOperationEffects);

        expect(effects).toBeTruthy();
        expect(effects.getCardOperations).toBeObservable(expectedActions$);
    });
});
