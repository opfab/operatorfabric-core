/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Component, OnInit} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {CheckAuthenticationStatus} from '@ofActions/authentication.actions';
import {AppState} from '@ofStore/index';
import {selectCurrentUrl, selectRouterState} from '@ofSelectors/router.selectors';
import {selectExpirationTime} from '@ofSelectors/authentication.selectors';
import {TranslateService} from "@ngx-translate/core";
import {isInTheFuture} from "@ofServices/authentication.service";
// import Fs from 'fs';

@Component({
    selector: 'of-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    title = 'Operator Fabric';
    getRoutePE: Observable<any>;
    currentPath: any;
    isAuthenticated$: boolean;

    constructor(private store: Store<AppState>,
                private translate: TranslateService) {

        this.getRoutePE = this.store.pipe(select(selectRouterState));
        this.translate.setDefaultLang('en');
        console.log(navigator.language);
        this.translate.use('fr');
    }

    ngOnInit() {
        this.store.pipe(select(selectCurrentUrl)).subscribe(url => this.currentPath = url);
        this.store.pipe(select(selectExpirationTime),
            map(isInTheFuture)
                        ).subscribe(isAUth => this.isAuthenticated$ = isAUth);
        // First Action send by the application, is the user currently authenticated ?
        this.store.dispatch(new CheckAuthenticationStatus());
    }
}
