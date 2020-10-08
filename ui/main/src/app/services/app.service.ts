/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from '@ofStore/index';
import { ClearLightCardSelection } from '@ofStore/actions/light-card.actions';

export enum PageType {
    FEED, ARCHIVE, THIRPARTY, SETTING, ABOUT, CALENDAR
}

@Injectable()
export class AppService {

    constructor(private store: Store<AppState>, private _router: Router) {}

    get pageType(): PageType {

        if ( this._router.routerState.snapshot.url.startsWith("/feed") ) {
            return PageType.FEED;
        } else if ( this._router.routerState.snapshot.url.startsWith("/archives") ) {
            return PageType.ARCHIVE;
        } else if ( this._router.routerState.snapshot.url.startsWith("/businessconfigparty") ) {
            return PageType.THIRPARTY;
        } else if ( this._router.routerState.snapshot.url.startsWith("/setting") ) {
            return PageType.SETTING;
        } else if ( this._router.routerState.snapshot.url.startsWith("/about") ) {
            return PageType.ABOUT;
        } else if ( this._router.routerState.snapshot.url.startsWith("/calendar") ) {
            return PageType.CALENDAR;
        }
    }

    closeDetails(currentPath: string) {
        this.store.dispatch(new ClearLightCardSelection());
        this._router.navigate(['/' + currentPath, 'cards']);
    }
}