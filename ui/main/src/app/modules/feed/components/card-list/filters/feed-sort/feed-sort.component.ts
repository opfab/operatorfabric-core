/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import {FormControl, FormGroup} from '@angular/forms';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {UserPreferencesService} from '@ofServices/user-preference.service';
import {SortService} from '@ofServices/lightcards/sort.service';

@Component({
  selector: 'of-feed-sort',
  templateUrl: './feed-sort.component.html',
  styleUrls: ['./feed-sort.component.scss']
}) export class FeedSortComponent implements OnInit, OnDestroy {

  @Input() hideSeveritySort: boolean;
  @Input() hideReadSort: boolean;


  private ngUnsubscribe$ = new Subject<void>();
  sortForm: FormGroup;

  constructor(private store: Store<AppState>, private userPreferences: UserPreferencesService, private sortService: SortService) {

  }

  ngOnInit() {
    this.sortForm = this.createFormGroup();
    this.initSort();
  }

  private createFormGroup(): FormGroup {
    const initialValue = !this.hideReadSort ? 'unread' : 'date';
    return new FormGroup({
      sortControl: new FormControl(initialValue)
    }, {updateOn: 'change'});
  }

  initSort() {

    const sortChoice = this.getInitialSort(); 
    this.sortForm.get('sortControl').setValue(sortChoice);
    this.sortService.setSortBy(sortChoice);

    this.sortForm
      .valueChanges
      .pipe(
        takeUntil(this.ngUnsubscribe$))
      .subscribe(form => {
        this.userPreferences.setPreference('opfab.feed.sort.type', form.sortControl);
        this.sortService.setSortBy(form.sortControl);
      });
  }


  private getInitialSort():string {
    let sortedChoice = 'date';
    const sortedPreference = this.userPreferences.getPreference('opfab.feed.sort.type');
    if (!!sortedPreference) {
      if (!(sortedPreference === 'unread' && this.hideReadSort) && !(sortedPreference === 'severity' && this.hideSeveritySort)) {
        sortedChoice = sortedPreference;
      }
    } else if (!this.hideReadSort) sortedChoice = 'unread';
    return sortedChoice;
  }


  ngOnDestroy() {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

}
