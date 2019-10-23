/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, OnInit, Input } from '@angular/core';
import {UpdateArchivePage} from '@ofActions/archive.actions';
import {Store, select} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import { selectArchiveCount } from '@ofStore/selectors/archive.selectors';
import { tap, catchError } from 'rxjs/operators';
import { of, Observable } from 'rxjs';
import { buildConfigSelector } from '@ofStore/selectors/config.selectors';

@Component({
  selector: 'of-archive-list-page',
  templateUrl: './archive-list-page.component.html',
  styleUrls: ['./archive-list-page.component.scss']
})
export class ArchiveListPageComponent implements OnInit {

  collectionSize$: Observable<number>;
  first$: Observable<number>;
  size$: Observable<number>;
  constructor(private store: Store<AppState>) {}
  ngOnInit(): void {
    this.collectionSize$ = this.store.pipe(
      select(selectArchiveCount),
      catchError(err => of(0))
    );
    this.size$ = this.store.select(buildConfigSelector('archive.filters.page.size'));
    this.first$ = this.store.select(buildConfigSelector('archive.filters.page.first'));
  }

  updateResultPage(currentPage): void {
    this.store.dispatch(new UpdateArchivePage({page: currentPage - 1}));
  }
}
