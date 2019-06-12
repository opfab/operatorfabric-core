/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {CardDetailsComponent} from './card-details.component';
import {DetailsComponent} from "../details/details.component";
import {DetailComponent} from "../detail/detail.component";
import {Store, StoreModule} from "@ngrx/store";
import {appReducer, AppState} from "@ofStore/index";
import {RouterTestingModule} from "@angular/router/testing";
import {LoadCardSuccess} from "@ofActions/card.actions";
import {getOneRandomCard, getOneRandomThird, getRandomI18nData} from "@tests/helpers";
import {By} from "@angular/platform-browser";
import {ThirdsI18nLoaderFactory, ThirdsService} from "../../../../services/thirds.service";
import {ServicesModule} from "@ofServices/services.module";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {HandlebarsService} from "../../services/handlebars.service";
import {TimeService} from "@ofServices/time.service";
import {TranslateLoader, TranslateModule} from "@ngx-translate/core";
import {of} from "rxjs";
import {Action, ActionType, Process, State} from "@ofModel/thirds.model";
import {Detail} from "@ofModel/card.model";
import {Map as OfMap} from "@ofModel/map";

describe('CardDetailsComponent', () => {
    let component: CardDetailsComponent;
    let fixture: ComponentFixture<CardDetailsComponent>;
    let store: Store<AppState>;
    let thirdsService: ThirdsService;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                ServicesModule,
                StoreModule.forRoot(appReducer),
                RouterTestingModule,
                TranslateModule.forRoot({
                    loader: {
                        provide: TranslateLoader,
                        useFactory: ThirdsI18nLoaderFactory,
                        deps: [ThirdsService]
                    },
                    useDefaultLang: false
                })
            ],
            declarations: [CardDetailsComponent, DetailsComponent, DetailComponent],
            providers: [ThirdsService, HandlebarsService, TimeService]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        store = TestBed.get(Store);
        spyOn(store, 'dispatch').and.callThrough();
        fixture = TestBed.createComponent(CardDetailsComponent);
        component = fixture.componentInstance;
        thirdsService = TestBed.get(ThirdsService);
    });

    it('should create empty', () => {
        fixture.detectChanges();
        const child = fixture.debugElement.children[0];
        expect(component).toBeTruthy();
        expect(child.name).toEqual("of-details")
    });

    it('should create with card selected', () => {
        spyOn(thirdsService, 'queryThird').and.returnValue(of(getOneRandomThird()));
        fixture.detectChanges();
        expect(component).toBeTruthy();
        expect(fixture.debugElement.queryAll(By.css("of-detail")).length).toEqual(0);
        store.dispatch(new LoadCardSuccess({card: getOneRandomCard()}));
        fixture.detectChanges();
        const child = fixture.debugElement.children[0];
        expect(child.name).toEqual("of-details")
        expect(fixture.debugElement.queryAll(By.css("of-detail")).length).toEqual(2);
    });
    it('should create with card selected without details and third with details', () => {
        const processesMap= new OfMap();
        const statesMap = new OfMap();
        const details = [new Detail(null, getRandomI18nData(),null,"template3",null),
            new Detail(null, getRandomI18nData(),null,"template4",null),];
        statesMap['state01']=new State(details);
        processesMap['process01']=new Process(statesMap);
        const third = getOneRandomThird({
            processes:processesMap
        });
        spyOn(thirdsService, 'queryThird').and.returnValue(of(third));
        fixture.detectChanges();
        expect(component).toBeTruthy();
        expect(fixture.debugElement.queryAll(By.css("of-detail")).length).toEqual(0);
        let testCard = getOneRandomCard(
            {
                process: 'process01',
                processId: 'process01_01',
                state: 'state01',
                details:[]
            });
        store.dispatch(new LoadCardSuccess({card: testCard}));
        fixture.detectChanges();
        let child = fixture.debugElement.children[0];
        expect(child.name).toEqual("of-details")
        expect(fixture.debugElement.queryAll(By.css("of-detail")).length).toEqual(2);
        testCard ={...testCard, details: null};
        store.dispatch(new LoadCardSuccess({card: testCard}));
        fixture.detectChanges();
        child = fixture.debugElement.children[0];
        expect(child.name).toEqual("of-details")
        expect(fixture.debugElement.queryAll(By.css("of-detail")).length).toEqual(2);
    });
    it('should create with card selected with details and third with details', () => {
        const processesMap= new OfMap();
        const statesMap = new OfMap();
        const details = [new Detail(null, getRandomI18nData(),null,"template3",null),
            new Detail(null, getRandomI18nData(),null,"template4",null),];
        statesMap['state01']=new State(details);
        processesMap['process01']=new Process(statesMap);
        const third = getOneRandomThird({
            processes:processesMap
        });

        spyOn(thirdsService, 'queryThird').and.returnValue(of(third));
        fixture.detectChanges();
        expect(component).toBeTruthy();
        expect(fixture.debugElement.queryAll(By.css("of-detail")).length).toEqual(0);
        const testCard = getOneRandomCard(
            {
                process: 'process01',
                processId: 'process01_01',
                state: 'state01',
            });
        store.dispatch(new LoadCardSuccess({card: testCard}));
        fixture.detectChanges();
        const child = fixture.debugElement.children[0];
        expect(child.name).toEqual("of-details")
        expect(fixture.debugElement.queryAll(By.css("of-detail")).length).toEqual(4);
    });
});
