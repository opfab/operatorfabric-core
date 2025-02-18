/* Copyright (c) 2018-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {ConfigService} from 'app/services/config/ConfigService';
import {Subject, debounceTime, takeUntil} from 'rxjs';
import {FeedFilterAndSortIconsComponent} from './feed-filter-and-sort-icons/feed-filter-and-sort-icons.component';
import {FeedSearchComponent} from './feed-search/feed-search.component';
import {NgIf} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {OpfabEventStreamService} from '@ofServices/events/OpfabEventStreamService';

@Component({
    selector: 'of-filters',
    templateUrl: './filters.component.html',
    styleUrls: ['./filters.component.scss'],
    standalone: true,
    imports: [FeedFilterAndSortIconsComponent, FeedSearchComponent, NgIf, TranslateModule]
})
export class FiltersComponent implements OnInit, OnDestroy {
    @Input() filterActive: boolean;

    @Output() showFiltersAndSort = new Subject<any>();

    showSearchFilter: boolean;

    unsubscribe$: Subject<void> = new Subject<void>();

    loadingInProgress = false;

    ngOnInit() {
        this.showSearchFilter = ConfigService.getConfigValue('feed.showSearchFilter', false);

        OpfabEventStreamService.getLoadingInProgress()
            .pipe(takeUntil(this.unsubscribe$), debounceTime(500))
            .subscribe((loadingInProgress: boolean) => {
                this.loadingInProgress = loadingInProgress;
            });
    }

    onShowFiltersAndSortChange(filterAndsort: any) {
        this.showFiltersAndSort.next(filterAndsort);
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
