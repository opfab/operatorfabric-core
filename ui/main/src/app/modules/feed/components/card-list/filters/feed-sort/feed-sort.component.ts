/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {UserPreferencesService} from 'app/business/services/users/user-preference.service';
import {LightCardsFeedFilterService} from 'app/business/services/lightcards/lightcards-feed-filter.service';

@Component({
    selector: 'of-feed-sort',
    templateUrl: './feed-sort.component.html',
    styleUrls: ['./feed-sort.component.scss']
})
export class FeedSortComponent implements OnInit, OnDestroy {
    @Input() defaultSorting: string;

    private ngUnsubscribe$ = new Subject<void>();
    sortForm: FormGroup<{
        sortControl: FormControl<string | null>;
    }>;

    constructor(private lightCardsFeedFilterService: LightCardsFeedFilterService) {}

    ngOnInit() {
        this.sortForm = this.createFormGroup();
        this.initSort();
    }

    private createFormGroup(): FormGroup {
        const initialValue = this.defaultSorting;
        return new FormGroup(
            {
                sortControl: new FormControl<string | null>(initialValue)
            },
            {updateOn: 'change'}
        );
    }

    initSort() {
        const sortChoice = this.getInitialSort();
        this.sortForm.get('sortControl').setValue(sortChoice);
        this.lightCardsFeedFilterService.setSortBy(sortChoice);

        this.sortForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe$)).subscribe((form) => {
            UserPreferencesService.setPreference('opfab.feed.sort.type', form.sortControl);
            this.lightCardsFeedFilterService.setSortBy(form.sortControl);
        });
    }

    private getInitialSort(): string {
        let sortedChoice = this.defaultSorting;
        const sortedPreference = UserPreferencesService.getPreference('opfab.feed.sort.type');
        if (sortedPreference) sortedChoice = sortedPreference;
        return sortedChoice;
    }

    ngOnDestroy() {
        this.ngUnsubscribe$.next();
        this.ngUnsubscribe$.complete();
    }
}
