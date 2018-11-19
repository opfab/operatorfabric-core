/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Component, OnInit} from '@angular/core';
import {navigationRoutes} from './app-routing.module';
import {Store} from '@ngrx/store';
import {AppState} from '@state/app.interface';
import {Observable} from 'rxjs';
import {getCurrentUrl, selectRouterState} from '@state/app.reducer';
import {TempAutomaticLogIn} from '@state/authentication/authentication.actions';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    title = 'Operator Fabric';
    navigationRoutes = navigationRoutes;
    getRoutePE: Observable<any>;
    currentPath: any;

    constructor(private store: Store<AppState>) {
        this.getRoutePE = this.store.select(selectRouterState);
    }

    ngOnInit() {
        this.store.select(getCurrentUrl).subscribe(url => this.currentPath = url);
        // First Action send by the application. Try to log in with a default user
        this.store.dispatch(new TempAutomaticLogIn());
    }


}
