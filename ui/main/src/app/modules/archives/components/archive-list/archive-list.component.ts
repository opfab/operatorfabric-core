/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Component, Input, OnInit} from '@angular/core';
import {LightCard} from '@ofModel/light-card.model';
import {Observable, of} from 'rxjs';
import { AppState } from '@ofStore/index';
import { Store, select } from '@ngrx/store';
import { catchError, tap } from 'rxjs/operators';
import { selectArchiveLightCards } from '@ofStore/selectors/archive.selectors';

@Component({
  selector: 'of-archive-list',
  templateUrl: './archive-list.component.html',
  styleUrls: ['./archive-list.component.scss']
})
export class ArchiveListComponent implements OnInit {

  @Input() public lightCards: LightCard[];
  @Input() public selection: Observable<string>;

  constructor(private store: Store<AppState>) { }

  ngOnInit(): void {
  }


}
