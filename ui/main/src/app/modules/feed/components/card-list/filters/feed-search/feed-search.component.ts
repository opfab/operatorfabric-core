/* Copyright (c) 2022, Alliander (http://www.alliander.com)
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, Input, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';
import {LightCardsFeedFilterService} from 'app/business/services/lightcards/lightcards-feed-filter.service';

@Component({
    selector: 'of-feed-search',
    templateUrl: './feed-search.component.html',
    styleUrls: ['./feed-search.component.scss']
})
export class FeedSearchComponent implements OnInit {
    @Input() showSearchFilter: boolean;

    searchControl = new FormControl();
    placeholder : string;

    constructor(
        private lightCardsFeedFilterService: LightCardsFeedFilterService,
        private translateService: TranslateService
    ) {}

    ngOnInit() {
        this.placeholder = this.translateService.instant('feed.searchPlaceholderText');
        this.lightCardsFeedFilterService.setSearchTermForTextFilter("");
        this.searchControl.valueChanges.subscribe(searchTerm => {
            this.lightCardsFeedFilterService.setSearchTermForTextFilter(searchTerm);
        })
    }
}
