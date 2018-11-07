/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {LightCardsComponent} from './light-cards.component';
import {MatButtonModule, MatCardModule} from '@angular/material';
import {LightCardsListComponent} from './components/light-cards-list/light-cards-list.component';
import {LightCardDetailsComponent} from './components/light-card-details/light-card-details.component';
import {TestingModule} from '@testing/utils';
import {AppState} from '@state/app.interface';
import {Store, StoreModule} from '@ngrx/store';
import {LoadLightCardsSuccess} from '@state/light-card/light-card.actions';
import {I18nData, LightCard, Severity} from '@state/light-card/light-card.model';
import * as fromReducers from '@state/app.reducer';
import * as fromStore from '@state/light-card';
import {By} from '@angular/platform-browser';

describe('LightCardsComponent', () => {
    let component: LightCardsComponent;
    let store: Store<AppState>;
    let fixture: ComponentFixture<LightCardsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                // from https://github.com/ngrx/platform/blob/master/docs/store/testing.md
                StoreModule.forRoot(fromReducers.appReducer),
                MatCardModule, MatButtonModule, TestingModule],
            declarations: [LightCardsListComponent, LightCardsComponent, LightCardDetailsComponent]
            , providers: [{provide: Store, useClass: Store}]
        })
            .compileComponents();
    }));
    beforeEach(() => {
        store = TestBed.get(Store);
        spyOn(store, 'dispatch').and.callThrough();
        fixture = TestBed.createComponent(LightCardsComponent);
        component = fixture.componentInstance;

    });

    it('should create an empty component with title ' +
        'only when there is no lightCards', () => {
        fixture.detectChanges();
        const compiled = fixture.debugElement.nativeElement;
        expect(component).toBeTruthy();
        // title exists
        expect(compiled.querySelector('h3').textContent).toContain('Light Cards');
        // no list in it
        expect(compiled.querySelector('ul')).toBeFalsy();
    });

    it('should create a list with one element when there are ' +
        'only one card in the state', () => {
        // const compiled = fixture.debugElement.nativeElement;
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

        const action = new LoadLightCardsSuccess({lightCards: [oneCard] as LightCard[]});
        store.dispatch(action);
        const lightCards$ = store.select(fromStore.getAllLightCards);
        lightCards$.subscribe(lightCard => {
            expect(lightCard).toEqual([oneCard]);
        });
        expect(store.dispatch).toHaveBeenCalledWith(action);
        expect(component).toBeTruthy();
        const compiled = fixture.debugElement.nativeElement;
        fixture.detectChanges();

        // title exists
        expect(compiled.querySelector('h3').textContent).toContain('Light Cards');
        // a list exists
        expect(compiled.querySelector('ul')).toBeTruthy();
    });

    it('should create a list with two elements when there are ' +
        'only two cards in the state', () => {
        // const compiled = fixture.debugElement.nativeElement;
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
        const anotherCard = new LightCard('uid0'
            , 'id0'
            , 2
            , 3
            , Severity.QUESTION
            , 'mainRecipient'
            , 'processId'
            , 4
            , title
            , summary
        );
        const action = new LoadLightCardsSuccess({lightCards: [oneCard, anotherCard] as LightCard[]});
        store.dispatch(action);
        const lightCards$ = store.select(fromStore.getAllLightCards);
        lightCards$.subscribe(lightCard => {
            expect(lightCard).toEqual([oneCard, anotherCard]);
        });
        expect(store.dispatch).toHaveBeenCalledWith(action);
        expect(component).toBeTruthy();
        const compiled = fixture.debugElement.nativeElement;
        fixture.detectChanges();

        // title exists
        expect(compiled.querySelector('h3').textContent).toContain('Light Cards');
        // a list exists
        expect(compiled.querySelector('ul')).toBeTruthy();
        // counts the list elements
        const listElements = fixture.debugElement.queryAll(By.css('li'));
        const numberOfCardsInTheActionPayload = 2;
        expect(listElements.length).toEqual(numberOfCardsInTheActionPayload);
    });

    it('should create a list with two cards when two arrays of one card are dispatched' +
        ' 1', () => {
        // const compiled = fixture.debugElement.nativeElement;
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
        const anotherCard = new LightCard('uid0'
            , 'id0'
            , 2
            , 3
            , Severity.QUESTION
            , 'mainRecipient'
            , 'processId'
            , 4
            , title
            , summary
        );
        const action = new LoadLightCardsSuccess({lightCards: [oneCard]});
        store.dispatch(action);
        const action0 = new LoadLightCardsSuccess({lightCards: [anotherCard]});
        store.dispatch(action0);
        const lightCards$ = store.select(fromStore.getAllLightCards);
        lightCards$.subscribe(lightCard => {
            expect(lightCard).toEqual([oneCard, anotherCard]);
        });
        expect(store.dispatch).toHaveBeenCalledWith(action);
        expect(component).toBeTruthy();
        const compiled = fixture.debugElement;
        fixture.detectChanges();

        // title exists
        expect(compiled.nativeElement.querySelector('h3').textContent).toContain('Light Cards');
        // a list exists
        expect(compiled.nativeElement.querySelector('ul')).toBeTruthy();
        // counts list elements
        const listElements = fixture.debugElement.queryAll(By.css('li'));
        const totalNumberOfLightCardsPassByActions = 2;
        expect(listElements.length).toEqual(totalNumberOfLightCardsPassByActions);

    });
});
