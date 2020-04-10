/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, OnInit } from '@angular/core';
import {Store} from "@ngrx/store";
import {AppState} from "@ofStore/index";
import {ChangeSort} from "@ofActions/feed.actions";

@Component({
  selector: 'of-severity-sort',
  templateUrl: './severity-sort.component.html'
})export class SeveritySortComponent implements OnInit {

  toggleActive = false;

  constructor(private store: Store<AppState>) { }

  ngOnInit() {
  }

  toggleSort(): void {
    this.toggleActive = !this.toggleActive;
    this.store.dispatch(new ChangeSort());
  }

}
