/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CardsListComponent} from './components/cards-list/cards-list.component';
import {MatButtonModule, MatCardModule, MatListModule} from '@angular/material';
import {CardsComponent} from './cards.component';
import {FormsModule} from '@angular/forms';
import {StateModule} from '@state/state.module';
import {CardDetailsComponent} from './components/card-details/card-details.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatListModule,
    MatCardModule,
    MatButtonModule,

    StateModule
  ],
  declarations: [CardsListComponent, CardsComponent, CardDetailsComponent],
  exports: [CardsComponent]
})
export class CardsModule {
}
