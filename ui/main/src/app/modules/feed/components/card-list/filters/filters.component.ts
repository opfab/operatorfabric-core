/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



import {Component, OnInit, OnDestroy} from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState } from '@ofStore/index';
import { buildConfigSelector } from '@ofStore/selectors/config.selectors';
import { selectSubscriptionOpen } from '@ofStore/selectors/cards-subscription.selectors';
import {  Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

@Component({
  selector: 'of-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.scss']
})
export class FiltersComponent implements OnInit,OnDestroy {

  hideTags$: Observable<boolean>;
  hideTimerTags$: Observable<boolean>;
  hideAckFilter$: Observable<boolean>;
  cardsSubscriptionOpen$ : Observable<boolean>;
  filterByPublishDate : boolean = true;
  private ngUnsubscribe$ = new Subject<void>();

  constructor(private store: Store<AppState>) { }

  ngOnInit() {
    this.hideTags$ = this.store.select(buildConfigSelector('settings.tags.hide'));
    this.hideTimerTags$ = this.store.select(buildConfigSelector('feed.card.hideTimeFilter'));
    this.hideAckFilter$ = this.store.select(buildConfigSelector('feed.card.hideAckFilter'));
    this.cardsSubscriptionOpen$ = this.store.select(selectSubscriptionOpen);
    
    // When time line is hide , we use a date filter by business date and not publish date
    this.store.select(buildConfigSelector('feed.timeline.hide'))
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(
        hideTimeLine => this.filterByPublishDate = !hideTimeLine
      )
  }

  ngOnDestroy() {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
}
}
