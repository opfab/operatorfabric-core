/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, OnInit } from '@angular/core';
import {Observable, combineLatest} from 'rxjs';
import {Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import {buildConfigSelector} from '@ofSelectors/config.selectors';
import { FormGroup, FormControl } from '@angular/forms';
import { UpdateArchiveFilter } from '@ofStore/actions/archive.actions';
import { IArchiveFilter } from '@ofModel/archive-filter.model';


@Component({
  selector: 'of-archive-filters',
  templateUrl: './archive-filters.component.html',
  styleUrls: ['./archive-filters.component.css']
})
export class ArchiveFiltersComponent implements OnInit {

  publishers$: Observable<string []>;
  processes$: Observable<string []>;

  archiveForm: FormGroup;

  constructor(private store: Store<AppState>) {
    this.archiveForm = new FormGroup({
      publisher: new FormControl(''),
      process: new FormControl(),
      startNotifDate: new FormControl(''),
      endNotifDate: new FormControl(''),
      startBusnDate: new FormControl(''),
      endBusnDate: new FormControl(''),
    });
  }


  ngOnInit() {
    this.publishers$ = this.store.select(buildConfigSelector('archive.filters.publisher.list'));
    this.processes$ = this.store.select(buildConfigSelector('archive.filters.process.list'));
  }

  sendQuery(filters: IArchiveFilter): void {

    this.store.dispatch(new UpdateArchiveFilter({filters}));
  }

}
