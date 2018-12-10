/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LightCardsListComponent} from './components/light-cards-list/light-cards-list.component';
import {MatButtonModule, MatCardModule, MatListModule} from '@angular/material';
import {LightCardsComponent} from './light-cards.component';
import {FormsModule} from '@angular/forms';
import {StateModule} from '@state/state.module';
import {LightCardDetailsComponent} from './components/light-card-details/light-card-details.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatListModule,
    MatCardModule,
    MatButtonModule,

    StateModule
  ],
  declarations: [LightCardsListComponent, LightCardsComponent, LightCardDetailsComponent],
  exports: [LightCardsComponent]
})
export class LightCardsModule {
}
