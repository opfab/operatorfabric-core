/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import {ClearLightCardSelection} from '@ofStore/actions/light-card.actions';

export enum PageType {
    UNKNOWN, FEED, ARCHIVE, THIRPARTY, SETTING, ABOUT, CALENDAR, MONITORING, USERCARD
}

@Injectable()
export class AppService {

    private pageConf = new Map([
        ['feed', PageType.FEED]
        , ['archives', PageType.ARCHIVE]
        , ['businessconfigparty', PageType.THIRPARTY]
        , ['setting', PageType.SETTING]
        , ['about', PageType.ABOUT]
        , ['calendar', PageType.CALENDAR]
        , ['monitoring', PageType.MONITORING]
        , ['usercard' , PageType.USERCARD]

    ]);


    constructor(private store: Store<AppState>, private _router: Router) {
    }

    get pageType(): PageType {
        const UrlElements = this._router.routerState.snapshot.url.split('/');
        const PAGE_NAME_INDEX = 1;
        const pageName = UrlElements[PAGE_NAME_INDEX];
        const currentPageType = this.pageConf.get(pageName);
        return (!!currentPageType) ? currentPageType : PageType.UNKNOWN;
    }

    closeDetails(currentPath: string) {
        this.store.dispatch(new ClearLightCardSelection());
        this._router.navigate(['/' + currentPath, 'cards']);
    }
}
