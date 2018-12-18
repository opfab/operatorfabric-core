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
import {LightCardsModule} from './components/light-cards/light-cards.module';
import {AppRoutingModule} from './app-routing.module';
import {CoreModule} from './core/core.module';
import {AppComponent} from './app.component';
import {ArchivesComponent} from './components/archives/archives.component';
import {NavbarComponent} from './components/navbar/navbar.component';
import {LoginModule} from "./components/login/login.module";
import {CommonModule} from "@angular/common";

@NgModule({

  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    LightCardsModule,
    LoginModule,
    AppRoutingModule,
    HttpClientModule,
    StateModule.forRoot(),
    CoreModule.forRoot(),
    NgbModule.forRoot()
  ],
  declarations: [AppComponent, ArchivesComponent, NavbarComponent],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
