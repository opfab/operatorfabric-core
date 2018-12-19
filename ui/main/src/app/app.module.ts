/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HttpClientModule} from '@angular/common/http';
import {StateModule} from '@ofStore/state.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {FeedModule} from './modules/feed/feed.module';
import {AppRoutingModule} from './app-routing.module';
import {ServicesModule} from '@ofServices/services.module';
import {AppComponent} from './app.component';
import {NavbarComponent} from './components/navbar/navbar.component';
import {LoginModule} from './components/login/login.module';
import {CommonModule} from '@angular/common';
import {ArchivesModule} from "./modules/archives/archives.module";

@NgModule({

  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    FeedModule,
    ArchivesModule,
    LoginModule,
    AppRoutingModule,
    HttpClientModule,
    StateModule.forRoot(),
    ServicesModule.forRoot(),
    NgbModule.forRoot()
  ],
  declarations: [AppComponent, NavbarComponent],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
