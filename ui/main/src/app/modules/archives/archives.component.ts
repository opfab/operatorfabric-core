/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Component, OnInit} from '@angular/core';
import {Observable, of} from "rxjs";
import {LightCard} from "@ofModel/light-card.model";
import {select, Store} from "@ngrx/store";
import * as feedSelectors from "@ofSelectors/feed.selectors";
import {catchError} from "rxjs/operators";
import {AppState} from "@ofStore/index";
import {selectArchiveLightCards, selectArchiveLightCardSelection} from "@ofSelectors/archive.selectors";

@Component({
  selector: 'of-archives',
  templateUrl: './archives.component.html',
  styleUrls: ['./archives.component.scss']
})
export class ArchivesComponent implements OnInit {

  lightCards$: Observable<LightCard[]>;
  selection$: Observable<string>;

  constructor(private store: Store<AppState>) { }

  ngOnInit() {
    this.lightCards$ = this.store.pipe(
        select(selectArchiveLightCards),
        catchError(err => of([]))
    );
    this.selection$ = this.store.select(selectArchiveLightCardSelection);
  }

}
