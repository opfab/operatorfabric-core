
import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HttpClientModule} from '@angular/common/http';
import {CommonModule, HashLocationStrategy, LocationStrategy} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {StateModule} from '@ofStore/state.module';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {ServicesModule} from '@ofServices/services.module';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {NavbarComponent} from './components/navbar/navbar.component';
import {LoginComponent} from './components/login/login.component';
import {IconComponent} from './components/navbar/icon/icon.component';
import {TranslateModule} from '@ngx-translate/core';
import {translateConfig} from './translate.config';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {library} from '@fortawesome/fontawesome-svg-core';
import {faExternalLinkAlt, faSignOutAlt} from '@fortawesome/free-solid-svg-icons';
import {InfoComponent} from './components/navbar/info/info.component';
import {UtilitiesModule} from './modules/utilities/utilities.module';
import {MenuLinkComponent} from './components/navbar/menus/menu-link/menu-link.component';
import {CustomLogoComponent} from './components/navbar/custom-logo/custom-logo.component';
import {OAuthModule} from 'angular-oauth2-oidc';

library.add(faExternalLinkAlt);
library.add(faSignOutAlt);

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
        TranslateModule.forRoot(translateConfig),
        FontAwesomeModule,
        UtilitiesModule,
        AppRoutingModule
    ],
    declarations: [AppComponent,
        NavbarComponent,
        LoginComponent,
        IconComponent,
        InfoComponent,
        MenuLinkComponent,
        CustomLogoComponent],
    providers: [{provide: LocationStrategy, useClass: HashLocationStrategy}],
    bootstrap: [AppComponent]
})
export class AppModule {
}
