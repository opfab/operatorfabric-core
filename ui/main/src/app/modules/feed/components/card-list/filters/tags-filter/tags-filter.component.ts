/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import {Observable, Subject, timer} from 'rxjs';
import {FilterType} from '@ofModel/feed-filter.model';
import {debounce, distinctUntilChanged, first, takeUntil} from 'rxjs/operators';
import * as _ from 'lodash-es';
import {FilterService} from '@ofServices/lightcards/filter.service';

@Component({
    selector: 'of-tags-filter',
    templateUrl: './tags-filter.component.html',
    styleUrls: ['./tags-filter.component.scss']
})
export class TagsFilterComponent implements OnInit, OnDestroy {

    tagFilterForm: FormGroup;
    private ngUnsubscribe$ = new Subject<void>();
    private _filter$: Observable<any>;

    constructor(private formBuilder: FormBuilder, private store: Store<AppState>,private filterService:FilterService) {
        this.tagFilterForm = this.createFormGroup();
    }

    ngOnInit() {
        this._filter$ = this.filterService.getFiltersChanges();
        this._filter$.pipe(takeUntil(this.ngUnsubscribe$)).subscribe(() => {
            const tagsFilter = this.filterService.getFilters()[FilterType.TAG_FILTER];
            if (tagsFilter) {
                this.tagFilterForm.get('tags').setValue(tagsFilter.active ? tagsFilter.status.tags : [], {emitEvent: false});
            } else {
                this.tagFilterForm.get('tags').setValue([], {emitEvent: false});
            }
        });
        this._filter$.pipe(first(), takeUntil(this.ngUnsubscribe$)).subscribe(() => {
            this.tagFilterForm
                .valueChanges
                .pipe(
                    takeUntil(this.ngUnsubscribe$),
                    distinctUntilChanged((formA, formB) => {
                        return _.difference(formA.tags, formB.tags).length === 0 && _.difference(formB.tags, formA.tags).length === 0;
                    }),
                    debounce(() => timer(500)))
                .subscribe(form => {
                    this.filterService.updateFilter(
                            FilterType.TAG_FILTER,
                            form.tags.length > 0,
                            form
                        );
                });
        });
    }

    ngOnDestroy() {
        this.ngUnsubscribe$.next();
        this.ngUnsubscribe$.complete();
    }

    private createFormGroup() {
        return this.formBuilder.group({
                tags: []
            }
        );
    }
}
