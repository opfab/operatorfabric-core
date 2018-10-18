/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {AfterViewInit, Component, OnInit} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {AppState} from '@state/app.interface';
import {Observable} from 'rxjs';
import {Card} from '@state/card/card.model';
import * as fromStore from '@state/card';
import {LoadCards} from '@state/card/card.actions';
import {LoadCardOperations} from "@state/card-operation/card-operation.actions";

@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.css']
})
export class CardsComponent implements OnInit , AfterViewInit{

  cards$: Observable<Card[]>;
  constructor(private store: Store<AppState>) { }

  ngOnInit() {
    this.store.dispatch(new LoadCards());
    this.cards$ = this.store.pipe(select(fromStore.getAllCards));
  }


  ngAfterViewInit(){

  }
}
