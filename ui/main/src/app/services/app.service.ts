/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {SelectedCardService} from 'app/business/services/card/selectedCard.service';
import {RouterStore} from 'app/business/store/router.store';

export enum PageType {
    UNKNOWN,
    FEED,
    ARCHIVE,
    THIRPARTY,
    SETTING,
    ABOUT,
    CALENDAR,
    MONITORING,
    USERCARD
}

@Injectable({
    providedIn: 'root'
})
export class AppService {


    private pageConf = new Map([
        ['feed', PageType.FEED],
        ['archives', PageType.ARCHIVE],
        ['businessconfigparty', PageType.THIRPARTY],
        ['setting', PageType.SETTING],
        ['about', PageType.ABOUT],
        ['calendar', PageType.CALENDAR],
        ['monitoring', PageType.MONITORING],
        ['usercard', PageType.USERCARD]
    ]);

    constructor(
        private routerStore: RouterStore,
        private _router: Router,
        private selectedCardService: SelectedCardService
    ) {
    }

    get pageType(): PageType {
        const pageName = this.routerStore.getCurrentRoute()
        const currentPageType = this.pageConf.get(pageName);
        return !!currentPageType ? currentPageType : PageType.UNKNOWN;
    }

    closeDetails() {
        this.selectedCardService.clearSelectedCardId();
        this._router.navigate(['/' + this.routerStore.getCurrentRoute()]);
    }

    reopenDetails(currentPath: string, cardId: string) {
        this._router.navigate(['/' + this.routerStore.getCurrentRoute(), 'cards', cardId]);
    }
}
