/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {FeedComponent} from './feed.component';
import {CardListComponent} from './components/card-list/card-list.component';
import {appReducer, AppState, storeConfig} from '@ofStore/index';
import {Store, StoreModule} from '@ngrx/store';
import {LoadLightCardsSuccess} from '@ofStore/actions/light-card.actions';
import {LightCard} from '@ofModel/light-card.model';
import * as fromStore from '@ofStore/selectors/feed.selectors';
import {By} from '@angular/platform-browser';
import {
    getOneRandomLightCard,
    getPositiveRandomNumberWithinRange,
    getSeveralRandomLightCards
} from '../../../tests/helpers';
import {RouterTestingModule} from "@angular/router/testing";
import {TimeLineComponent} from "./components/time-line/time-line.component";
import {CardsModule} from "../cards/cards.module";
import {HttpClientModule} from "@angular/common/http";
import {RouterStateSerializer, StoreRouterConnectingModule} from "@ngrx/router-store";
import {CustomRouterStateSerializer} from "@ofStates/router.state";
import {TranslateModule} from "@ngx-translate/core";
import {NO_ERRORS_SCHEMA} from "@angular/core";
import {ServicesModule} from "@ofServices/services.module";
import {compareByPublishDate} from "@ofStates/feed.state";
import {AuthenticationImportHelperForSpecs} from "@ofServices/authentication/authentication.service.spec";

describe('FeedComponent', () => {
    let component: FeedComponent;
    let store: Store<AppState>;
    let fixture: ComponentFixture<FeedComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                ServicesModule,
                StoreModule.forRoot(appReducer, storeConfig),
                RouterTestingModule,
                StoreRouterConnectingModule,
                HttpClientModule,
                CardsModule,
                TranslateModule.forRoot()],
            declarations: [CardListComponent, FeedComponent, TimeLineComponent],
            providers: [
                Store,
                {provide: RouterStateSerializer, useClass: CustomRouterStateSerializer},
                AuthenticationImportHelperForSpecs],
            schemas: [ NO_ERRORS_SCHEMA ]
        })
            .compileComponents();
    }));
    beforeEach(() => {
        store = TestBed.get(Store);
        spyOn(store, 'dispatch').and.callThrough();
        // avoid exceptions during construction and init of the component
        // spyOn(store, 'pipe').and.callFake(() => of('/test/url'));
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
        expect(compiled.querySelector('.calc-height-feed-content > div')).toBeFalsy();
    });

    it('should create a list with one element when there are ' +
        'only one card in the state', () => {
        // const compiled = fixture.debugElement.nativeElement;
        const oneCard = getOneRandomLightCard();

        const action = new LoadLightCardsSuccess({lightCards: [oneCard] as LightCard[]});
        store.dispatch(action);
        const lightCards$ = store.select(fromStore.selectSortedFilteredLightCards);
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
        expect(compiled.querySelector('.calc-height-feed-content > div')).toBeTruthy();
    });

    it('should create a list with two elements when there are ' +
        'only two cards in the state', () => {
        // const compiled = fixture.debugElement.nativeElement;
        const oneCard = getOneRandomLightCard();
        const anotherCard = getOneRandomLightCard();
        const action = new LoadLightCardsSuccess({lightCards: [oneCard, anotherCard] as LightCard[]});
        store.dispatch(action);
        const lightCards$ = store.select(fromStore.selectSortedFilteredLightCards);
        lightCards$.subscribe(lightCard => {
            expect(lightCard).toEqual([oneCard, anotherCard].sort(compareByPublishDate)); //This is the default sort
        });
        expect(store.dispatch).toHaveBeenCalledWith(action);
        expect(component).toBeTruthy();
        const compiled = fixture.debugElement.nativeElement;
        fixture.detectChanges();

        // title exists
        // expect(compiled.querySelector('h3').textContent).toContain('Feed');
        // a list exists
        expect(compiled.querySelector('.calc-height-feed-content > div')).toBeTruthy();
        // counts the list elements
        const listElements = fixture.debugElement.queryAll(By.css('.calc-height-feed-content > div'));
        const numberOfCardsInTheActionPayload = 2;
        expect(listElements.length).toEqual(numberOfCardsInTheActionPayload);
    });

    it('should create a list with two cards when two arrays of one card are dispatched' +
        ' 1', () => {
        // const compiled = fixture.debugElement.nativeElement;
        const oneCard = getOneRandomLightCard({publishDate:Date.now()});
        const anotherCard = getOneRandomLightCard({publishDate:Date.now()+3600000});
        const action = new LoadLightCardsSuccess({lightCards: [oneCard]});
        store.dispatch(action);
        const action0 = new LoadLightCardsSuccess({lightCards: [anotherCard]});
        store.dispatch(action0);
        const lightCards$ = store.select(fromStore.selectSortedFilteredLightCards);
        lightCards$.subscribe(lightCard => {
            expect(lightCard).toEqual([anotherCard,oneCard].sort(compareByPublishDate)); //default sort
        });
        expect(store.dispatch).toHaveBeenCalledWith(action);
        expect(component).toBeTruthy();
        const compiled = fixture.debugElement;
        fixture.detectChanges();

        // title exists
        // expect(compiled.nativeElement.querySelector('h3').textContent).toContain('Feed');
        // a list exists
        expect(compiled.nativeElement.querySelector('.calc-height-feed-content > div')).toBeTruthy();
        // counts list elements
        const listElements = fixture.debugElement.queryAll(By.css('.calc-height-feed-content > div'));
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
        const listElements = fixture.debugElement.queryAll(By.css('.calc-height-feed-content > div'));
        expect(listElements.length).toEqual(totalNumberOfLightCards);

    });
});
