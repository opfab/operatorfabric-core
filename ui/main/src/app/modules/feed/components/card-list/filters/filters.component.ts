/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, Input, OnInit, Output} from '@angular/core';
import {ConfigService} from 'app/business/services/config.service';
import {LightCardsStoreService} from 'app/business/services/lightcards/lightcards-store.service';
import {Subject} from 'rxjs';

@Component({
    selector: 'of-filters',
    templateUrl: './filters.component.html',
    styleUrls: ['./filters.component.scss']
})
export class FiltersComponent implements OnInit {

    @Input() filterActive: boolean;

    @Output() showFiltersAndSort = new Subject<any>();

    showSearchFilter: boolean;

    loadingInProgress = false;

    constructor(
        private configService: ConfigService,
        private lightCardsStoreService: LightCardsStoreService,

    ) {}

    ngOnInit() {
        this.showSearchFilter = this.configService.getConfigValue('feed.showSearchFilter', false);

        this.lightCardsStoreService
            .getLoadingInProgress()
            .subscribe((inProgress: boolean) => (this.loadingInProgress = inProgress));
    }

    onShowFiltersAndSortChange(filterAndsort: any) {
        this.showFiltersAndSort.next(filterAndsort);
    }

}
