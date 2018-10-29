/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Component, OnInit } from '@angular/core';
import {AppState} from "../../state/app.interface";
import {select, Store} from '@ngrx/store';
import {Observable} from "rxjs";
import {CardOperation} from "../../state/card-operation/card-operation.model";
import {LoadCardOperations} from "../../state/card-operation/card-operation.actions";
import * as fromStore from '../../state/card-operation/index';
@Component({
  selector: 'app-card-operations',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent implements OnInit {

  cardOperations$: Observable<CardOperation[]>;
  constructor(private store: Store<AppState>) { }

  ngOnInit() {
    this.store.dispatch(new LoadCardOperations());
    this.cardOperations$ = this.store.pipe(select(fromStore.getAllCardOperations));
  }

}
