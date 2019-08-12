/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, OnInit } from '@angular/core';
import {UpdateArchivePage} from "@ofActions/archive.actions";
import {Store} from "@ngrx/store";
import {AppState} from "@ofStore/index";

@Component({
  selector: 'of-archive-list-page',
  templateUrl: './archive-list-page.component.html',
  styleUrls: ['./archive-list-page.component.scss']
})
export class ArchiveListPageComponent implements OnInit {

  page = 4;
  constructor(private store: Store<AppState>) { }

  ngOnInit() {
  }

  updateResultPage(pageNumber: number): void {
    this.store.dispatch(new UpdateArchivePage({pageNumber: pageNumber}));
  }
}

//TODO Highlight selected page
//TODO Disable previous/next when reaching start or end. Do we really need previous/next ?
//TODO What happens if huge number of pages ?
//TODO Switch to dark colours
