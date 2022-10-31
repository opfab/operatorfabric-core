/* Copyright (c) 2018-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import {ConfigService} from '@ofServices/config.service';
import {LightCardsStoreService} from '@ofServices/lightcards/lightcards-store.service';

@Component({
    selector: 'of-filters',
    templateUrl: './filters.component.html',
    styleUrls: ['./filters.component.scss']
})
export class FiltersComponent implements OnInit {
    hideResponseFilter: boolean;
    hideTimerTags: boolean;
    hideApplyFiltersToTimeLineChoice: boolean;
    defaultSorting: string;
    defaultAcknowledgmentFilter: string;
    showSearchFilter: boolean;

    loadingInProgress = false;

    constructor(
        private store: Store<AppState>,
        private configService: ConfigService,
        private lightCardsStoreService: LightCardsStoreService,
    ) {}

    ngOnInit() {
        this.defaultSorting = this.configService.getConfigValue('feed.defaultSorting', 'unread');
        this.defaultAcknowledgmentFilter = this.configService.getConfigValue('feed.defaultAcknowledgmentFilter', 'notack');
        this.hideTimerTags = this.configService.getConfigValue('feed.card.hideTimeFilter', false);
        this.hideResponseFilter = this.configService.getConfigValue('feed.card.hideResponseFilter', false);
        this.hideApplyFiltersToTimeLineChoice = this.configService.getConfigValue(
            'feed.card.hideApplyFiltersToTimeLineChoice',
            false
        );
        this.showSearchFilter = this.configService.getConfigValue('feed.showSearchFilter', false);
        this.lightCardsStoreService
            .getLoadingInProgress()
            .subscribe((inProgress: boolean) => (this.loadingInProgress = inProgress));
    }
}
