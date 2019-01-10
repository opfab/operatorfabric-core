/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Component, OnInit} from '@angular/core';
import {navigationRoutes} from '../../app-routing.module';
import {select, Store} from '@ngrx/store';
import {TryToLogOut} from '@ofActions/authentication.actions';
import {AppState} from '@ofStore/index';
import {selectCurrentUrl} from '@ofSelectors/router.selectors';

@Component({
  selector: 'of-navbar',
  templateUrl: './navbar.component.html',
})
export class NavbarComponent implements OnInit {

    navbarCollapsed = true;
    navigationRoutes = navigationRoutes;
    currentPath: any;

    constructor(private store: Store<AppState>) {
    }

    ngOnInit() {
        this.store.select(selectCurrentUrl).subscribe(url=>{
            if(url)
                this.currentPath = url.split('/')[1];
        })
    }


    logOut(){
        this.store.dispatch(new TryToLogOut());
    }
}
