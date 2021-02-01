/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
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
    if (this.hideReadSort) {
      this.readSorted = false;
      this.store.dispatch(new ChangeReadSort());
    }

    this.sortForm
    .valueChanges
    .pipe(
        takeUntil(this.ngUnsubscribe$))
    .subscribe(form => {

        if (form.sortControl === "unread") {
          if (this.severitySorted) {
            this.severitySorted = false;
            this.store.dispatch(new ChangeSort());
          }
          this.readSorted = true;
          return this.store.dispatch(new ChangeReadSort());
        }

        if (this.readSorted) {
          this.readSorted = false;
          this.store.dispatch(new ChangeReadSort());
        }

        if (form.sortControl === "date" && this.severitySorted) {
          this.severitySorted = false;
          return this.store.dispatch(new ChangeSort());
        }

        if (form.sortControl === "severity" && !this.severitySorted) {
          this.severitySorted = true;
          return this.store.dispatch(new ChangeSort());
        }

    });
  }

  ngOnDestroy() {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

}
