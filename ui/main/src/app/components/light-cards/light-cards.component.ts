/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {AfterViewInit, Component, OnInit} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {AppState} from '../../state/app.interface';
import {Observable} from 'rxjs';
import {LightCard} from '../../state/light-card/light-card.model';
import * as fromStore from '../../state/light-card/index';
import {LoadLightCards} from '../../state/light-card/light-card.actions';
import {LoadCardOperations} from "../../state/card-operation/card-operation.actions";

@Component({
  selector: 'app-cards',
  templateUrl: './light-cards.component.html',
  styleUrls: ['./light-cards.component.css']
})
export class LightCardsComponent implements OnInit , AfterViewInit{

  lightCards$: Observable<LightCard[]>;
  constructor(private store: Store<AppState>) { }

  ngOnInit() {
    this.store.dispatch(new LoadLightCards());
    this.lightCards$ = this.store.pipe(select(fromStore.getAllCards));
  }


  ngAfterViewInit(){

  }
}
