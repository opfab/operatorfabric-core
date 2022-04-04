/* Copyright (c) 2018-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {RouterTestingModule} from '@angular/router/testing';
import {Store, StoreModule} from '@ngrx/store';
import {appReducer, AppState} from '@ofStore/index';
import {AuthenticationService} from "@ofServices/authentication/authentication.service";
import {LoginComponent} from "./login.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {TranslateModule} from "@ngx-translate/core";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {RejectLogIn, TryToLogIn} from "@ofActions/authentication.actions";
import {Message, MessageLevel} from "@ofModel/message.model";
import {I18n} from "@ofModel/i18n.model";
import {By} from "@angular/platform-browser";
import SpyObj = jasmine.SpyObj;
import createSpyObj = jasmine.createSpyObj;

describe('LoginComponent', () => {

    let store: Store<AppState>;

    let component: LoginComponent;
    let fixture: ComponentFixture<LoginComponent>;

    beforeEach(waitForAsync(() => {
        const authenticationServiceSpy = createSpyObj('authenticationService'
            , ['extractToken',
                'verifyExpirationDate',
                'clearAuthenticationInformation',
                'extractIdentificationInformation',
                'askTokenFromPassword',
                'checkAuthentication',
                'askTokenFromCode',
                'isAuthModeCodeOrImplicitFlow'
            ]);
        createSpyObj('Store', ['dispatch','select']);
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                NgbModule,
                FormsModule,
                ReactiveFormsModule,
                RouterTestingModule,
                TranslateModule.forRoot(),
                StoreModule.forRoot(appReducer)
            ],
            declarations: [LoginComponent],
            providers: [
                {provide: Store, useClass: Store},
                {provide: AuthenticationService, useValue: authenticationServiceSpy},
            ]
        })
            .compileComponents();
        store = TestBed.inject(Store);
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
    it('should display error message', () => {
        store.dispatch(new RejectLogIn({error: new Message('message', MessageLevel.ERROR, new I18n("message.key"))}));
        component.ngOnInit();
        fixture.detectChanges();
        expect(component).toBeTruthy();
        expect( fixture.debugElement.queryAll(By.css('.alert')).length).toBe(1);
        expect( fixture.nativeElement.querySelector('.alert').innerText).toEqual("message.key");
    });
    it('should submit', () => {
        spyOn(store, 'dispatch').and.callThrough();
        component.ngOnInit();
        component.userForm.get('identifier').setValue('id');
        component.userForm.get('password').setValue('pwd');
        component.onSubmit();
        expect( store.dispatch).toHaveBeenCalledWith(new TryToLogIn({username: 'id', password: 'pwd'}));
    });
    it('should reset', () => {
        spyOn(store, 'dispatch').and.callThrough();
        component.ngOnInit();
        component.userForm.get('identifier').setValue('id');
        component.userForm.get('password').setValue('pwd');
        component.resetForm();
        expect(component.userForm.get('identifier').value).toBeNull();
        expect(component.userForm.get('password').value).toBeNull();
    });
});
