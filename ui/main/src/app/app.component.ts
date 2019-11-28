/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {AfterContentInit, AfterViewInit, Component, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {select, Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {InitAuthStatus} from '@ofActions/authentication.actions';
import {AppState} from '@ofStore/index';
import {selectCurrentUrl, selectRouterState} from '@ofSelectors/router.selectors';
import {selectExpirationTime} from '@ofSelectors/authentication.selectors';
import {isInTheFuture} from "@ofServices/authentication.service";
import {LoadConfig} from "@ofActions/config.actions";
import {selectConfigLoaded, selectMaxedRetries} from "@ofSelectors/config.selectors";
import {I18nService} from "@ofServices/i18n.service";
import {buildConfigSelector} from '@ofSelectors/config.selectors';

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
    configLoaded: boolean = false ;
    private maxedRetries: boolean = false;

    /**
     * NB: I18nService is injected to trigger its constructor at application startup
     * @param store
     * @param i18nService
     */
    constructor(private store: Store<AppState>,
                private i18nService:I18nService,
                private titleService:Title) {
        this.getRoutePE = this.store.pipe(select(selectRouterState));
    }

    public setTitle(newTitle:string) {
        this.titleService.setTitle(newTitle);
    }

    /**
     * On Init the app take trace of the current url and of the authentication status
     * Once the subscription done, send an Action to Check the current authentication status.
     */
    ngOnInit() {
        console.log(`location: ${location.href}`)
        let i = window.location.href.indexOf('code');
        if(i != -1){
            this.store.dispatch(new InitAuthStatus({code:window.location.href.substring(i + 5)}))
        }
        this.store.pipe(select(selectCurrentUrl)).subscribe(url => this.currentPath = url);
        this.store.pipe(select(selectExpirationTime),
            map(isInTheFuture)
                        ).subscribe(isAUth => this.isAuthenticated$ = isAUth);
        this.store
            .select(selectConfigLoaded)
            .subscribe(loaded => this.configLoaded = loaded);
        this.store
            .select(selectMaxedRetries)
            .subscribe((maxedRetries=>this.maxedRetries=maxedRetries));
        // First Action send by the application, is the user currently authenticated ?
        this.store.dispatch(new LoadConfig());

        const sTitle = this.store.select(buildConfigSelector('title', this.title));
        sTitle.subscribe(data => {
            this.setTitle(data);
        })
    }
}
