/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import { DetailComponent } from './detail.component';
import {getOneRandomCard} from '@tests/helpers';
import {ThirdsService} from "../../services/thirds.service";
import {ServicesModule} from "@ofServices/services.module";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {StoreModule} from "@ngrx/store";
import {appReducer} from "@ofStore/index";

describe('DetailComponent', () => {
    let component: DetailComponent;
    let fixture: ComponentFixture<DetailComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                StoreModule.forRoot(appReducer),
                ServicesModule,
                HttpClientTestingModule
            ],
            declarations: [DetailComponent],
            providers: [ThirdsService]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DetailComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        component.card = getOneRandomCard();
        component.detail = component.card.details[0];
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });
});
