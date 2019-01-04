/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {FeedComponent} from './feed.component';
import {MatButtonModule, MatCardModule} from '@angular/material';
import {CardListComponent} from './components/card-list/card-list.component';
import {CardComponent} from './components/card/card.component';
import {appReducer, AppState} from '../../store/index';
import {Store, StoreModule} from '@ngrx/store';
import {LoadLightCardsSuccess} from '../../store/actions/light-card.actions';
import {LightCard} from '@ofModel/light-card.model';
import * as fromStore from '../../store/selectors/light-card.selectors';
import {By} from '@angular/platform-browser';
import {getOneRandomLigthCard, getPositiveRandomNumberWithinRange, getSeveralRandomLightCards} from '../../../tests/helpers';
import {RouterTestingModule} from "@angular/router/testing";
import {TimeLineComponent} from "./components/time-line/time-line.component";

describe('FeedComponent', () => {
    let component: FeedComponent;
    let store: Store<AppState>;
    let fixture: ComponentFixture<FeedComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                StoreModule.forRoot(appReducer),
                RouterTestingModule,
                MatCardModule, MatButtonModule],
            declarations: [CardListComponent, FeedComponent, CardComponent, TimeLineComponent]
            , providers: [{provide: Store, useClass: Store}]
        })
            .compileComponents();
    }));
    beforeEach(() => {
        store = TestBed.get(Store);
        spyOn(store, 'dispatch').and.callThrough();
        fixture = TestBed.createComponent(FeedComponent);
        component = fixture.componentInstance;

    });

    it('should create an empty component with title ' +
        'only when there is no lightCards', () => {
        fixture.detectChanges();
        const compiled = fixture.debugElement.nativeElement;
        expect(component).toBeTruthy();
        // title exists
        // expect(compiled.querySelector('h3').textContent).toContain('Feed');
        // no list in it
        expect(compiled.querySelector('.feed-content > div')).toBeFalsy();
    });

    it('should create a list with one element when there are ' +
        'only one card in the state', () => {
        // const compiled = fixture.debugElement.nativeElement;
        const oneCard = getOneRandomLigthCard();

        const action = new LoadLightCardsSuccess({lightCards: [oneCard] as LightCard[]});
        store.dispatch(action);
        const lightCards$ = store.select(fromStore.selectAllLightCards);
        lightCards$.subscribe(lightCard => {
            expect(lightCard).toEqual([oneCard]);
        });
        expect(store.dispatch).toHaveBeenCalledWith(action);
        expect(component).toBeTruthy();
        const compiled = fixture.debugElement.nativeElement;
        fixture.detectChanges();

        // title exists
        // expect(compiled.querySelector('h3').textContent).toContain('Feed');
        // a list exists
        expect(compiled.querySelector('.feed-content > div')).toBeTruthy();
    });

    it('should create a list with two elements when there are ' +
        'only two cards in the state', () => {
        // const compiled = fixture.debugElement.nativeElement;
        const oneCard = getOneRandomLigthCard();
        const anotherCard = getOneRandomLigthCard();
        const action = new LoadLightCardsSuccess({lightCards: [oneCard, anotherCard] as LightCard[]});
        store.dispatch(action);
        const lightCards$ = store.select(fromStore.selectAllLightCards);
        lightCards$.subscribe(lightCard => {
            expect(lightCard).toEqual([oneCard, anotherCard]);
        });
        expect(store.dispatch).toHaveBeenCalledWith(action);
        expect(component).toBeTruthy();
        const compiled = fixture.debugElement.nativeElement;
        fixture.detectChanges();

        // title exists
        // expect(compiled.querySelector('h3').textContent).toContain('Feed');
        // a list exists
        expect(compiled.querySelector('.feed-content > div')).toBeTruthy();
        // counts the list elements
        const listElements = fixture.debugElement.queryAll(By.css('.feed-content > div'));
        const numberOfCardsInTheActionPayload = 2;
        expect(listElements.length).toEqual(numberOfCardsInTheActionPayload);
    });

    it('should create a list with two cards when two arrays of one card are dispatched' +
        ' 1', () => {
        // const compiled = fixture.debugElement.nativeElement;
        const oneCard = getOneRandomLigthCard();
        const anotherCard = getOneRandomLigthCard();
        const action = new LoadLightCardsSuccess({lightCards: [oneCard]});
        store.dispatch(action);
        const action0 = new LoadLightCardsSuccess({lightCards: [anotherCard]});
        store.dispatch(action0);
        const lightCards$ = store.select(fromStore.selectAllLightCards);
        lightCards$.subscribe(lightCard => {
            expect(lightCard).toEqual([oneCard, anotherCard]);
        });
        expect(store.dispatch).toHaveBeenCalledWith(action);
        expect(component).toBeTruthy();
        const compiled = fixture.debugElement;
        fixture.detectChanges();

        // title exists
        // expect(compiled.nativeElement.querySelector('h3').textContent).toContain('Feed');
        // a list exists
        expect(compiled.nativeElement.querySelector('.feed-content > div')).toBeTruthy();
        // counts list elements
        const listElements = fixture.debugElement.queryAll(By.css('.feed-content > div'));
        const totalNumberOfLightCardsPassByActions = 2;
        expect(listElements.length).toEqual(totalNumberOfLightCardsPassByActions);

    });

    it('should create a list with the number' +
        ' of cards equals to the sum of cards of the different arrays of each action dispatched', () => {
        const actionNumber = getPositiveRandomNumberWithinRange(2, 5);
        let totalNumberOfLightCards = 0;
        for (let i = 0; i <= actionNumber; ++i) {
            const currentNumberOfLightCards = getPositiveRandomNumberWithinRange(1, 4);
            totalNumberOfLightCards += currentNumberOfLightCards;
            const lightCards = getSeveralRandomLightCards(currentNumberOfLightCards);
            const action = new LoadLightCardsSuccess({lightCards: lightCards});
            store.dispatch(action);
            fixture.detectChanges();
        }
        const compiled = fixture.debugElement;
        expect(compiled.nativeElement.querySelector('.feed-content > div')).toBeTruthy();
        // counts list elements
        const listElements = fixture.debugElement.queryAll(By.css('.feed-content > div'));
        expect(listElements.length).toEqual(totalNumberOfLightCards);

    });
});
