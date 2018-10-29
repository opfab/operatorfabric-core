/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HttpClientModule} from '@angular/common/http';
import {StateModule} from '@state/state.module';
import {CardsModule} from './components/cards/cards.module';
import {AppRoutingModule} from './app-routing.module';
import {CoreModule} from './core/core.module';
import {MatSidenavModule, MatTabsModule, MatToolbarModule} from '@angular/material';
import {ArchivesComponent} from './components/archives/archives.component';
import {LogInComponent} from './components/log-in/log-in.component';
import {CardOperationsModule} from './components/card-operations/card-operations.module';

@NgModule({

  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatSidenavModule,
    MatTabsModule,
    CardsModule,
    AppRoutingModule,
    HttpClientModule,
    StateModule.forRoot(),
    CoreModule.forRoot(),
    CardOperationsModule
  ],
  declarations: [AppComponent, ArchivesComponent, LogInComponent],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
