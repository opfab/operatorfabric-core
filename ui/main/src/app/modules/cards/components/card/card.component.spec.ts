/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {async, ComponentFixture, TestBed} from '@angular/core/testing';


import {CardComponent} from './card.component';
import {getOneRandomLigthCard} from '../../../../../tests/helpers';
import {RouterTestingModule} from "@angular/router/testing";
import {TranslateModule} from "@ngx-translate/core";
import {translateConfig} from "../../../../translate.config";
import {HttpClientModule} from "@angular/common/http";
import {Store, StoreModule} from "@ngrx/store";
import {appReducer, AppState} from "@ofStore/index";
import {of} from "rxjs";
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('CardComponent', () => {
    let lightCardDetailsComp: CardComponent;
    let fixture: ComponentFixture<CardComponent>;
    let store: Store<AppState>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [StoreModule.forRoot(appReducer),
                RouterTestingModule,
                HttpClientTestingModule,
                TranslateModule.forRoot(translateConfig)],
            declarations: [CardComponent],
            providers: [{provide: store, useClass: Store}]
        })
            .compileComponents();
        store = TestBed.get(Store);
        spyOn(store, 'dispatch').and.callThrough();
        // avoid exceptions during construction and init of the component
        spyOn(store, 'pipe').and.callFake(() => of('/test/url'));
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CardComponent);
        lightCardDetailsComp = fixture.debugElement.componentInstance;
    });

    it('should create and display minimal light card information', () => {
        const lightCard = getOneRandomLigthCard();

        // extract expected data
        const id = lightCard.id;
        const uid = lightCard.uid;
        const title = lightCard.title.key;
        const summaryValue = lightCard.summary.key;
        const publisher = lightCard.publisher;

        lightCardDetailsComp.lightCard = lightCard;

        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('.card-title').innerText)
            .toEqual(publisher+'.'+title);
        expect(fixture.nativeElement.querySelector('.card-body > p'))
            .toBeFalsy();
    });

});
