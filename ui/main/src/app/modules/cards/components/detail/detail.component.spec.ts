/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


import {async, ComponentFixture, getTestBed, TestBed} from '@angular/core/testing';

import {DetailComponent} from './detail.component';
import {
    getOneRandomCard,
    getOneRandomCardWithRandomDetails,
    getOneRandomThird,
    getRandomI18nData,
    getRandomIndex,
    AuthenticationImportHelperForSpecs
} from '@tests/helpers';
import {ThirdsI18nLoaderFactory, ThirdsService} from '../../../../services/thirds.service';
import {ServicesModule} from '@ofServices/services.module';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {StoreModule} from '@ngrx/store';
import {appReducer} from '@ofStore/index';
import {HandlebarsService} from '../../services/handlebars.service';
import {TimeService} from '@ofServices/time.service';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {environment} from '@env/environment';
import {By} from '@angular/platform-browser';
import {of} from 'rxjs';
import {Action, ActionType, Process, State} from '@ofModel/thirds.model';
import {Map as OfMap} from '@ofModel/map';
import {RouterTestingModule} from '@angular/router/testing';

describe('DetailComponent', () => {
    let component: DetailComponent;
    let fixture: ComponentFixture<DetailComponent>;
    let injector: TestBed;
    let httpMock: HttpTestingController;
    let thirdsService: ThirdsService;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                StoreModule.forRoot(appReducer),
                ServicesModule,
                HttpClientTestingModule,
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
            declarations: [DetailComponent],
            providers: [ThirdsService, HandlebarsService,
                {provide:'TimeEventSource',useValue:null},
                TimeService,
            AuthenticationImportHelperForSpecs]
        })
            .compileComponents();
        injector = getTestBed();
        httpMock = injector.get(HttpTestingController);
        thirdsService = TestBed.get(ThirdsService);
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DetailComponent);
        component = fixture.componentInstance;
    });
    // afterEach( ()=>{
    //     httpMock.verify();
    // })

    it('should create', () => {
        component.card = getOneRandomCard();
        component.detail = component.card.details[0];
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });
    it('should load template with script', ()=>{
        spyOn(thirdsService, 'queryThird').and.returnValue(of(getOneRandomThird()));
        component.card = getOneRandomCard();
        component.detail = component.card.details[0];
        component.ngOnInit();
        let calls = httpMock.match(req => req.url == `${environment.urls.thirds}/testPublisher/templates/template1`);
        expect(calls.length).toEqual(1);
        calls.forEach(call=>{
          call.flush('<div>div</div><script type="text/javascript">console.debug("log")</script>')
        });
        fixture.detectChanges();
        expect(component).toBeTruthy();
        expect(fixture.nativeElement.children[0].localName).toEqual('div');
        expect(fixture.nativeElement.children[0].children[0].localName).toEqual('div');
        expect(fixture.nativeElement.children[0].children[1].localName).toEqual('script');
    });
    it('should load template with action', (done)=>{
        const processesMap:OfMap<Process> = new OfMap();
        const statesMap:OfMap<State> = new OfMap();
        const actionMap:OfMap<Action> = new OfMap();
        actionMap['hidden2']=new Action(ActionType.URL, getRandomI18nData(), true,'btn-light');
        actionMap['hidden1']=new Action(ActionType.URL, getRandomI18nData(), true,'buttonStyle');
        statesMap['state01']=new State(null,actionMap);
        processesMap['process01']=new Process(statesMap);
        const third = getOneRandomThird({
            processes:processesMap
        });

        spyOn(thirdsService, 'queryThird').and.returnValue(of(third));
        component.card = getOneRandomCard({
            process: 'process01',
            processId: 'process01_1',
            state: 'state01',
        });
        component.detail = component.card.details[0];
        // component.ngOnInit();
        fixture.detectChanges();
        let calls = httpMock.match(req => req.url == `${environment.urls.thirds}/testPublisher/templates/template1`);
        expect(calls.length).toEqual(1);
        calls.forEach(call=>{
            call.flush('{{{action "hidden1"}}}{{{action "hidden2"}}}')
        });
        fixture.detectChanges();
        expect(component).toBeTruthy();
        setTimeout(()=>{
            fixture.detectChanges();
            expect(fixture.nativeElement.children[0].localName).toEqual('div');
            expect(fixture.nativeElement.children[0].children[0].localName).toEqual('button');
            expect(fixture.nativeElement.children[0].children[0].attributes[0].nodeName).toEqual('action-id');
            expect(fixture.nativeElement.children[0].children[0].attributes[0].nodeValue).toEqual('hidden1');
            expect(fixture.nativeElement.children[0].children[1].localName).toEqual('button');
            expect(fixture.nativeElement.children[0].children[1].attributes[0].nodeName).toEqual('action-id');
            expect(fixture.nativeElement.children[0].children[1].attributes[0].nodeValue).toEqual('hidden2');
            fixture.detectChanges();
            expect(fixture.nativeElement.children[0].children[0].classList[0]).toEqual('btn');
            expect(fixture.nativeElement.children[0].children[0].classList[1]).toEqual('buttonStyle');
            expect(fixture.nativeElement.children[0].children[1].classList[0]).toEqual('btn');
            expect(fixture.nativeElement.children[0].children[1].classList[1]).toEqual('btn-light');
            const alertSpy = spyOn(window, 'alert').and.callThrough();
            fixture.nativeElement.children[0].children[0].click();
            expect(alertSpy.calls.count()).toEqual(1);
            done();
        },1000);
    });
    it('should create css link when styles are set in the details', (done)=>{
        component.card = getOneRandomCardWithRandomDetails();
        const details = component.card.details
        component.detail = details[getRandomIndex(details)];
        const styles = component.detail.styles;
        expect(component.card).toBeTruthy();
        setTimeout( ()=>{
            fixture.detectChanges();
            const linkChildren = fixture.debugElement.queryAll(By.css('link'));
            //there are as many link tags as style in component.detail
            expect(linkChildren.length).toEqual(styles.length);

            let hrefs = '';
            linkChildren.forEach(link => {
                const native = link.nativeElement;
                const url = native.getAttribute('href');
               hrefs+=url;
            });
            // all styles are present in the link href urls
            styles.forEach(style =>{
                expect(hrefs.includes(style)).toEqual(true);
            });
            done();
        }, 1000);
    })
});
