/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


import {Component, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {select, Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import {AppState} from '@ofStore/index';
import {selectCurrentUrl, selectRouterState} from '@ofSelectors/router.selectors';
import {AuthenticationService} from "@ofServices/authentication/authentication.service";
import {LoadConfig} from "@ofActions/config.actions";
import {buildConfigSelector, selectConfigLoaded, selectMaxedRetries} from "@ofSelectors/config.selectors";
import {I18nService} from "@ofServices/i18n.service";

@Component({
    selector: 'of-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    readonly title = 'OperatorFabric';
    getRoutePE: Observable<any>;
    currentPath: any;
    isAuthenticated$: boolean = false;
    configLoaded: boolean = false;
    private maxedRetries: boolean = false;

    /**
     * NB: I18nService is injected to trigger its constructor at application startup
     * @param store
     * @param i18nService
     */
    constructor(private store: Store<AppState>,
                private i18nService: I18nService,
                private titleService: Title
        , private authenticationService: AuthenticationService) {
        this.getRoutePE = this.store.pipe(select(selectRouterState));
    }

    public setTitle(newTitle: string) {
        this.titleService.setTitle(newTitle);
    }

    /**
     * On Init the app take trace of the current url and of the authentication status
     * Once the subscription done, send an Action to Check the current authentication status.
     */
    ngOnInit() {
        console.log(`location: ${location.href}`);
        this.authenticationService.intializeAuthentication();
        this.store.pipe(select(selectCurrentUrl)).subscribe(url => this.currentPath = url);
        this.authenticationService.linkAuthenticationStatus(
            (isAuthenticated: boolean) => {
                this.isAuthenticated$ = isAuthenticated;
            });
        this.store
            .select(selectConfigLoaded)
            .subscribe(loaded => this.configLoaded = loaded);
        this.store
            .select(selectMaxedRetries)
            .subscribe((maxedRetries => this.maxedRetries = maxedRetries));
        this.store.dispatch(new LoadConfig());

        const sTitle = this.store.select(buildConfigSelector('title', this.title));
        sTitle.subscribe(data => {
            this.setTitle(data);
        });
    }
}
