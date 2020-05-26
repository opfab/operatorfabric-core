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
import {Detail} from '@ofModel/card.model';
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
        const processesMap = new OfMap();
        const statesMap = new OfMap();
        const details = [new Detail(null, getRandomI18nData(), null, 'template3', null),
            new Detail(null, getRandomI18nData(), null, 'template4', null)];
        statesMap['state01'] = new State(details);
        processesMap['process01'] = new Process(statesMap);
        const third = getOneRandomThird({
            processes: processesMap
        });
        spyOn(thirdsService, 'queryThird').and.returnValue(of(third));
        component.card = getOneRandomCard({
            process: 'process01',
            processId: 'process01_01',
            state: 'state01',
        });
        component.detail = component.card.details[0];

        fixture.detectChanges();
        expect(component).toBeTruthy();
    });
    it('should load template with script', ()=>{
                const processesMap = new OfMap();
        const statesMap = new OfMap();
        const details = [new Detail(null, getRandomI18nData(), null, 'template3', null),
            new Detail(null, getRandomI18nData(), null, 'template4', null)];
        statesMap['state01'] = new State(details);
        processesMap['process01'] = new Process(statesMap);
        const third = getOneRandomThird({
            processes: processesMap
        });
        spyOn(thirdsService, 'queryThird').and.returnValue(of(third));
        component.card = getOneRandomCard({
            process: 'process01',
            processId: 'process01_01',
            state: 'state01',
        });
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
