/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



import { Component, OnInit } from '@angular/core';
import {UpdateArchivePage} from '@ofActions/archive.actions';
import {Store, select} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import { selectArchiveCount,selectArchiveFilters} from '@ofStore/selectors/archive.selectors';
import { catchError } from 'rxjs/operators';
import { of, Observable,Subject } from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import { buildConfigSelector } from '@ofStore/selectors/config.selectors';

@Component({
  selector: 'of-archive-list-page',
  templateUrl: './archive-list-page.component.html',
  styleUrls: ['./archive-list-page.component.scss']
})
export class ArchiveListPageComponent implements OnInit {

  page: number = 0;
  collectionSize$: Observable<number>;
  size$: Observable<number>;
  unsubscribe$: Subject<void> = new Subject<void>();

  constructor(private store: Store<AppState>) {}
  ngOnInit(): void {
    this.collectionSize$ = this.store.pipe(
      select(selectArchiveCount),
      catchError(err => of(0))
    );
    this.size$ = this.store.select(buildConfigSelector('archive.filters.page.size'));

    this.store.select(selectArchiveFilters)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(filters => {
        const pageFilter = filters.get("page");
        // page on ngb-pagination component start at 1 , and page on backend start at 0 
        if (pageFilter) this.page = +pageFilter[0] + 1;
      })

  }

  updateResultPage(currentPage): void {

    // page on ngb-pagination component start at 1 , and page on backend start at 0 
    this.store.dispatch(new UpdateArchivePage({page: currentPage - 1}));
  }

  ngOnDestroy(){
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
