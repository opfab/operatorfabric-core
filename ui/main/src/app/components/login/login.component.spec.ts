/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {RouterTestingModule} from '@angular/router/testing';
import {Store, StoreModule} from '@ngrx/store';
import {appReducer, AppState} from '@ofStore/index';
import {AuthenticationService} from "@ofServices/authentication.service";
import {LoginComponent} from "./login.component";
import SpyObj = jasmine.SpyObj;
import createSpyObj = jasmine.createSpyObj;
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {TranslateModule} from "@ngx-translate/core";
import {translateConfig} from "../../translate.config";
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('LoginComponent', () => {

    let store: Store<AppState>;
    let authenticationService: SpyObj<AuthenticationService>;

    let component: LoginComponent;
    let fixture: ComponentFixture<LoginComponent>;

    beforeEach(async(() => {
        const authenticationServiceSpy = createSpyObj('authenticationService'
            , ['extractToken',
                'verifyExpirationDate',
                'clearAuthenticationInformation',
                'extractIdentificationInformation',
                'askTokenFromPassword',
                'checkAuthentication',
                'askTokenFromCode'
            ]);
        const storeSpy = createSpyObj('Store', ['dispatch','select']);
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                NgbModule.forRoot(),
                FormsModule,
                ReactiveFormsModule,
                RouterTestingModule,
                TranslateModule.forRoot(translateConfig),
                StoreModule.forRoot(appReducer)
            ],
            declarations: [LoginComponent],
            providers: [
                {provide: Store, useClass: Store},
                {provide: AuthenticationService, useValue: authenticationServiceSpy},
            ]
        })
            .compileComponents();
        store = TestBed.get(Store);
        // store.select.and.callThrough();
        // avoid exceptions during construction and init of the component
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(LoginComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
