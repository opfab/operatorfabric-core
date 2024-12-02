/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, Input, OnInit, Output} from '@angular/core';
import {ConfigService} from 'app/business/services/config.service';
import {OpfabStore} from 'app/business/store/opfabStore';
import {Subject} from 'rxjs';
import {FeedFilterAndSortIconsComponent} from './feed-filter-and-sort-icons/feed-filter-and-sort-icons.component';
import {FeedSearchComponent} from './feed-search/feed-search.component';
import {NgIf} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';

@Component({
    selector: 'of-filters',
    templateUrl: './filters.component.html',
    styleUrls: ['./filters.component.scss'],
    standalone: true,
    imports: [FeedFilterAndSortIconsComponent, FeedSearchComponent, NgIf, TranslateModule]
})
export class FiltersComponent implements OnInit {
    @Input() filterActive: boolean;

    @Output() showFiltersAndSort = new Subject<any>();

    showSearchFilter: boolean;

    loadingInProgress = false;

    ngOnInit() {
        this.showSearchFilter = ConfigService.getConfigValue('feed.showSearchFilter', false);

        OpfabStore.getLightCardStore()
            .getLoadingInProgress()
            .subscribe((inProgress: boolean) => (this.loadingInProgress = inProgress));
    }

    onShowFiltersAndSortChange(filterAndsort: any) {
        this.showFiltersAndSort.next(filterAndsort);
    }
}
