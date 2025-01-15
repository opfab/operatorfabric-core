/* Copyright (c) 2022, Alliander (http://www.alliander.com)
 * Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, Input, OnInit} from '@angular/core';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';
import {FilteredLightCardsStore} from 'app/business/store/lightcards/lightcards-feed-filter-store';
import {OpfabStore} from 'app/business/store/opfabStore';
import {NgIf} from '@angular/common';

@Component({
    selector: 'of-feed-search',
    templateUrl: './feed-search.component.html',
    styleUrls: ['./feed-search.component.scss'],
    standalone: true,
    imports: [NgIf, FormsModule, ReactiveFormsModule]
})
export class FeedSearchComponent implements OnInit {
    @Input() showSearchFilter: boolean;

    searchControl = new FormControl();
    placeholder: string;
    private readonly filteredLightCardStore: FilteredLightCardsStore;

    constructor(private readonly translateService: TranslateService) {
        this.filteredLightCardStore = OpfabStore.getFilteredLightCardStore();
    }

    ngOnInit() {
        this.placeholder = this.translateService.instant('feed.searchPlaceholderText');
        this.filteredLightCardStore.setSearchTermForTextFilter('');
        this.searchControl.valueChanges.subscribe((searchTerm) => {
            this.filteredLightCardStore.setSearchTermForTextFilter(searchTerm);
        });
    }
}
