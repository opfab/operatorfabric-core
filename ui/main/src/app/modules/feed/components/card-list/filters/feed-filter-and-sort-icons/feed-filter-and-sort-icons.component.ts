/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, Input, OnChanges, Output} from '@angular/core';
import {Subject} from 'rxjs';


@Component({
    selector: 'of-feed-filter-icon',
    templateUrl: './feed-filter-and-sort-icons.component.html',
    styleUrls: ['./feed-filter-and-sort-icons.component.scss']
})
export class FeedFilterAndSortIconsComponent implements OnChanges {
    @Input() filterActive: boolean;

    @Output() showFiltersAndSort = new Subject();


    filterSelected = false;
    sortSelected = false;

    filterIconCssClass = "opfab-icon-filter"

    toggleFilters() {
        this.filterSelected = !this.filterSelected;
        this.showFiltersAndSort.next({filter : this.filterSelected});
        this.computeIconClass();
    }

    ngOnChanges() {
        this.computeIconClass();
    }

    private computeIconClass(){
        if (this.filterSelected) {
            if (this.filterActive) this.filterIconCssClass = "opfab-icon-filter-open-active";
            else this.filterIconCssClass = "opfab-icon-filter-open";
        }
        else {
            if (this.filterActive) this.filterIconCssClass = "opfab-icon-filter-active";
            else this.filterIconCssClass = "opfab-icon-filter";
        }
    }

}