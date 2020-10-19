/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * Copyright (c) 2020, RTEi (http://www.rte-international.com)
 *  See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule, HashLocationStrategy, LocationStrategy } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StateModule } from '@ofStore/state.module';
import { ServicesModule } from '@ofServices/services.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { LoginComponent } from './components/login/login.component';
import { IconComponent } from './components/navbar/icon/icon.component';
import { TranslateModule } from '@ngx-translate/core';
import { InfoComponent } from './components/navbar/info/info.component';
import { UtilitiesModule } from './modules/utilities/utilities.module';
import { MenuLinkComponent } from './components/navbar/menus/menu-link/menu-link.component';
import { CustomLogoComponent } from './components/navbar/custom-logo/custom-logo.component';
import { OAuthModule } from 'angular-oauth2-oidc';
import { AboutComponent } from './modules/about/about.component';
import { FontAwesomeIconsModule } from './modules/utilities/fontawesome-icons.module';
import { LoggingModule } from './modules/logging/logging.module';
import { MonitoringModule } from './modules/monitoring/monitoring.module';
import { AdminModule } from './modules/admin/admin.module';
import { NgbModule, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { CountdownModule, CountdownGlobalConfig, CountdownConfig } from 'ngx-countdown';
import {CalendarModule} from './modules/calendar/calendar.module';
import { AppErrorHandler } from './common/error/app-error-handler';

export function countdownConfigFactory(): CountdownConfig {
    return { format: `mm:ss` };
  }

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    OAuthModule.forRoot(),
    HttpClientModule,
    StateModule.forRoot(),
    ServicesModule.forRoot(),
    NgbModule,
    TranslateModule.forRoot(),
    FontAwesomeIconsModule,
    UtilitiesModule,
    LoggingModule,
    MonitoringModule,
    NgbModalModule,
    AppRoutingModule,
    AdminModule,
    CountdownModule,
    CalendarModule
  ],
  declarations: [AppComponent,
    NavbarComponent,
    LoginComponent,
    IconComponent,
    InfoComponent,
    MenuLinkComponent,
    CustomLogoComponent,
    AboutComponent
  ],


  providers: [{ provide: LocationStrategy, useClass: HashLocationStrategy },
  { provide: CountdownGlobalConfig, useFactory: countdownConfigFactory },
  { provide: ErrorHandler, useClass: AppErrorHandler }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {

}
