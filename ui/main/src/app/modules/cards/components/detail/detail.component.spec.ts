/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {async, ComponentFixture, getTestBed, TestBed} from '@angular/core/testing';

import { DetailComponent } from './detail.component';
import {getOneRandomCard} from '@tests/helpers';
import {ThirdsI18nLoaderFactory, ThirdsService} from "../../../../services/thirds.service";
import {ServicesModule} from "@ofServices/services.module";
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
import {StoreModule} from "@ngrx/store";
import {appReducer} from "@ofStore/index";
import {HandlebarsService} from "../../services/handlebars.service";
import {TimeService} from "@ofServices/time.service";
import {TranslateLoader, TranslateModule} from "@ngx-translate/core";
import {environment} from "@env/environment";
import {By} from "@angular/platform-browser";

describe('DetailComponent', () => {
    let component: DetailComponent;
    let fixture: ComponentFixture<DetailComponent>;
    let injector: TestBed;
    let httpMock: HttpTestingController;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                StoreModule.forRoot(appReducer),
                ServicesModule,
                HttpClientTestingModule,
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
            providers: [ThirdsService, HandlebarsService, TimeService]
        })
            .compileComponents();
        injector = getTestBed();
        httpMock = injector.get(HttpTestingController);
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
        component.card = getOneRandomCard();
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
            expect(fixture.nativeElement.children[0].children[0].children[0].classList[0]).toEqual('contentStyle');
            expect(fixture.nativeElement.children[0].children[1].classList[0]).toEqual('btn');
            expect(fixture.nativeElement.children[0].children[1].classList[1]).toEqual('btn-light');
            expect(fixture.nativeElement.children[0].children[1].children[0].classList[0]).toEqual('fa');
            expect(fixture.nativeElement.children[0].children[1].children[0].classList[1]).toEqual('fa-warning');
            expect(fixture.nativeElement.children[0].children[1].children[0].classList[2]).toEqual('text-dark');
            const alertSpy = spyOn(window, 'alert').and.callThrough();
            fixture.nativeElement.children[0].children[0].click();
            expect(alertSpy.calls.count()).toEqual(1);
            done();
        },1000);
    });
});
