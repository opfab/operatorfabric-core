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
import {SendArchiveQuery} from "@ofActions/archive.actions";
import {selectArchiveFilters} from "@ofSelectors/archive.selectors";
import {ThirdsService} from "@ofServices/thirds.service";

@Component({
  selector: 'of-archive-filters',
  templateUrl: './archive-filters.component.html',
  styleUrls: ['./archive-filters.component.scss']
})
export class ArchiveFiltersComponent implements OnInit {

  publishers$:Observable<string []>;
  processes$:Observable<string []>;
  tags$:Observable<string []>; //TODO Not necessarily strings, could be value/labels or i18n but it doesn't seem to be a problem

  filters: Map<string,string[]>;

  constructor(private store:Store<AppState>) { }


  ngOnInit() {
    this.publishers$ = this.store.select(buildConfigSelector('archive.filters.publisher.list'));
    this.processes$ = this.store.select(buildConfigSelector('archive.filters.process.list'));
    this.tags$ = this.store.select(buildConfigSelector('archive.filters.tags.list'));

    this.store.select(selectArchiveFilters).subscribe( next => this.filters = next);
  }

  performNewSearch(): void{
    //TODO Clear currently selected card (from path and state), clear lightCards list
    let params = this.filters;
    params.set("page",["0"]);
    params.set("size",["3"]); //TODO Make page size a UI config property
    this.store.dispatch(new SendArchiveQuery({params: params}));
    //TODO Find out number of pages to create page list
  }

}
