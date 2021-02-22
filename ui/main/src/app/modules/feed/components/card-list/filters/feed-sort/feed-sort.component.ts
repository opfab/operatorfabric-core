/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import {Store} from "@ngrx/store";
import {AppState} from "@ofStore/index";
import {ChangeReadSort, ChangeSort} from "@ofActions/feed.actions";
import { FormControl, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { selectSortByRead, selectSortBySeverity } from '@ofStore/selectors/feed.selectors';

@Component({
  selector: 'of-feed-sort',
  templateUrl: './feed-sort.component.html',
  styleUrls: ['./feed-sort.component.scss']
})export class FeedSortComponent implements OnInit, OnDestroy {

  @Input() hideSeveritySort: boolean;
  @Input() hideReadSort: boolean;


  private ngUnsubscribe$ = new Subject<void>();
  sortForm: FormGroup;

  readSorted: boolean = true;
  severitySorted : boolean = false;

  constructor(private store: Store<AppState>) { 
   
  }

  ngOnInit() {
    this.sortForm = this.createFormGroup();
    this.initSort();
  }

  private createFormGroup(): FormGroup{
    const initialValue = !this.hideReadSort ? "unread" : "date";
    return new FormGroup({
      sortControl: new FormControl(initialValue)    
    },{updateOn: 'change'});

  }

  initSort() {

    this.store.select(selectSortBySeverity)
    .pipe(takeUntil(this.ngUnsubscribe$))
    .subscribe(bySev => {
      this.severitySorted = bySev;
    })
    this.store.select(selectSortByRead)
    .pipe(takeUntil(this.ngUnsubscribe$))
    .subscribe(byRead => {
      this.readSorted = byRead;
    })

    if (this.hideReadSort && this.readSorted) {
      this.store.dispatch(new ChangeReadSort());
    }

    if (this.hideSeveritySort && this.severitySorted) {
        this.store.dispatch(new ChangeSort());
    }

    const sorted = localStorage.getItem("opfab.feed.sort.type");
    if (!!sorted) {
      if (!(sorted === "unread" && this.hideReadSort) && !(sorted === "severity" && this.hideSeveritySort)) {
        this.sortForm.get("sortControl").setValue(sorted);
        this.setSortBy(sorted);
      }
    }

    this.sortForm
    .valueChanges
    .pipe(
        takeUntil(this.ngUnsubscribe$))
    .subscribe(form => {
        localStorage.setItem("opfab.feed.sort.type", form.sortControl);

        this.setSortBy(form.sortControl);
    });
  }

  setSortBy(sortBy: string) {
    if (sortBy === "unread") {
      if (this.severitySorted) {
        this.store.dispatch(new ChangeSort());
      }
      if (!this.readSorted) {
        return this.store.dispatch(new ChangeReadSort());
      }
      return;
    }

    if (this.readSorted) {
      this.store.dispatch(new ChangeReadSort());
    }

    if (sortBy === "date" && this.severitySorted) {
      return this.store.dispatch(new ChangeSort());
    }

    if (sortBy === "severity" && !this.severitySorted) {
      return this.store.dispatch(new ChangeSort());
    }
  }

  ngOnDestroy() {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

}
