/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { AppState } from '@ofStore/index';
import { AuthenticationService } from '@ofServices/authentication/authentication.service';
import { LoadConfig } from '@ofActions/config.actions';
import { buildConfigSelector, selectConfigLoaded, selectMaxedRetries } from '@ofSelectors/config.selectors';
import { selectIdentifier } from '@ofSelectors/authentication.selectors';
import { I18nService } from '@ofServices/i18n.service';

@Component({
    selector: 'of-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    readonly title = 'OperatorFabric';
    isAuthenticated$ = false;
    configLoaded = false;
    useCodeOrImplicitFlow = true;
    private maxedRetries = false;

    /**
     * NB: I18nService is injected to trigger its constructor at application startup
     */
    constructor(private store: Store<AppState>,
        private i18nService: I18nService,
        private titleService: Title
        , private authenticationService: AuthenticationService) {
    }

    ngOnInit() {

        this.loadConfiguration();
        this.launchAuthenticationProcessWhenConfigurationLoaded();
        this.waitForUserTobeAuthenticated();
        this.setTitle();
    }

    private loadConfiguration() {
        this.store.dispatch(new LoadConfig());
        this.store
            .select(selectMaxedRetries)
            .subscribe((maxedRetries => this.maxedRetries = maxedRetries));
    }

    private launchAuthenticationProcessWhenConfigurationLoaded() {
        this.store
            .select(selectConfigLoaded)
            .subscribe(loaded => {
                if (loaded) {
                    this.authenticationService.initializeAuthentication();
                    this.useCodeOrImplicitFlow = this.authenticationService.isAuthModeCodeOrImplicitFlow();
                }
                this.configLoaded = loaded;
            });
    }

    private waitForUserTobeAuthenticated() {
        this.store
            .select(selectIdentifier)
            .subscribe(identifier => {
                if (identifier) this.isAuthenticated$ = true;
            });
    }

    private setTitle() {
        this.store
            .select(buildConfigSelector('title', this.title))
            .subscribe(data => {
                this.titleService.setTitle(data);
            });
    }
}
