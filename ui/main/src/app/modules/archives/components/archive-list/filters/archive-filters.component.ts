/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, OnInit } from '@angular/core';
import {Observable} from "rxjs";
import {Store} from "@ngrx/store";
import {AppState} from "@ofStore/index";
import {buildConfigSelector} from "@ofSelectors/config.selectors";
import {TryToLogIn} from "@ofActions/authentication.actions";
import {SendArchiveQuery} from "@ofActions/archive.actions";
import {selectArchiveFilters} from "@ofSelectors/archive.selectors";

@Component({
  selector: 'of-archive-filters',
  templateUrl: './archive-filters.component.html',
  styleUrls: ['./archive-filters.component.css']
})
export class ArchiveFiltersComponent implements OnInit {

  publishers$:Observable<string []>;
  processes$:Observable<string []>;

  filters: Map<string,string[]>;

  constructor(private store:Store<AppState>) { }


  ngOnInit() {
    this.publishers$ = this.store.select(buildConfigSelector('archive.filters.publisher.list'));
    this.processes$ = this.store.select(buildConfigSelector('archive.filters.process.list'));

    this.store.select(selectArchiveFilters).subscribe( next => this.filters = next);
  }

  sendQuery(): void{
    this.store.dispatch(new SendArchiveQuery({params: this.filters}));
  }

}
