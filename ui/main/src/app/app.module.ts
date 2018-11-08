import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HttpClientModule} from '@angular/common/http';
import {StateModule} from '@state/state.module';
import {LightCardsModule} from './components/light-cards/light-cards.module';
import {AppRoutingModule} from './app-routing.module';
import {CoreModule} from './core/core.module';
import {MatSidenavModule, MatTabsModule, MatToolbarModule} from '@angular/material';
import {ArchivesComponent} from './components/archives/archives.component';
import {LogInComponent} from './components/log-in/log-in.component';
import {CardModule} from './components/card/card.module';

@NgModule({

  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatSidenavModule,
    MatTabsModule,
    LightCardsModule,
    AppRoutingModule,
    HttpClientModule,
    StateModule.forRoot(),
    CoreModule.forRoot(),
    CardModule
  ],
  declarations: [AppComponent, ArchivesComponent, LogInComponent],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
