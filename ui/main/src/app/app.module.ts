/* Copyright (c) 2018-2022, RTE (http://www.rte-france.com)
 * Copyright (c) 2020, RTEi (http://www.rte-international.com)
 *  See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {BrowserModule} from '@angular/platform-browser';
import {ErrorHandler, NgModule} from '@angular/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HttpClientModule, HTTP_INTERCEPTORS} from '@angular/common/http';
import {CommonModule, HashLocationStrategy, LocationStrategy} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {StateModule} from '@ofStore/state.module';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {LoginComponent} from './modules/core/application-loading/login/login.component';
import {TranslateModule} from '@ngx-translate/core';
import {OAuthModule} from 'angular-oauth2-oidc';
import {LoggingModule} from './modules/logging/logging.module';
import {MonitoringModule} from './modules/monitoring/monitoring.module';
import {AdminModule} from './modules/admin/admin.module';
import {CalendarModule} from './modules/calendar/calendar.module';
import {AppErrorHandler} from './common/error/app-error-handler';
import {ArchivesModule} from './modules/archives/archives.module';
import {NavbarModule} from './modules/navbar/navbar.module';
import {NgbModalModule, NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {TagInputModule} from 'ngx-chips';
import {TokenInjector} from '@ofServices/interceptors.service';
import {ActivityareaModule} from './modules/activityarea/activityarea.module';
import {AlertComponent} from './modules/core/alert/alert.component';
import {ConnectionLostComponent} from './modules/core/connection-lost/connection-lost.component';
import {SoundActivationComponent} from './modules/core/application-loading/sound-activation/sound-activation.component';
import {SessionEndComponent} from './modules/core/session-end/session-end.component';
import {ActivityAreaChoiceAfterLoginComponent} from './modules/core/application-loading/activityarea-choice-after-login/activityarea-choice-after-login.component';
import {AccountAlreadyUsedComponent} from './modules/core/application-loading/account-already-used/account-already-used.component';
import {AppLoadedInAnotherTabComponent} from './modules/core/application-loading/app-loaded-in-another-tab/app-loaded-in-another-tab.component';
import {ApplicationLoadingComponent} from './modules/core/application-loading/application-loading.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';

@NgModule({
    imports: [
        CommonModule,
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        TagInputModule,
        OAuthModule.forRoot(),
        HttpClientModule,
        StateModule.forRoot(),
        NgbModule,
        TranslateModule.forRoot(),
        ArchivesModule,
        LoggingModule,
        MonitoringModule,
        NgbModalModule,
        AppRoutingModule,
        AdminModule,
        CalendarModule,
        NavbarModule,
        ActivityareaModule,
        ServiceWorkerModule.register('ngsw-worker.js', {
          enabled: environment.production,
          // Register the ServiceWorker as soon as the application is stable
          // or after 30 seconds (whichever comes first).
          registrationStrategy: 'registerWhenStable:30000'
        })
    ],
    declarations: [
        AppComponent,
        LoginComponent,
        AlertComponent,
        ConnectionLostComponent,
        SoundActivationComponent,
        SessionEndComponent,
        ActivityAreaChoiceAfterLoginComponent,
        AccountAlreadyUsedComponent,
        AppLoadedInAnotherTabComponent,
        ApplicationLoadingComponent
    ],

    providers: [
        {provide: LocationStrategy, useClass: HashLocationStrategy},
        {provide: ErrorHandler, useClass: AppErrorHandler},
        {
            provide: HTTP_INTERCEPTORS,
            useClass: TokenInjector,
            multi: true
        }
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
