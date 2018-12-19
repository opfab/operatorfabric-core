/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CardListComponent} from './components/card-list/card-list.component';
import {MatButtonModule, MatCardModule, MatListModule} from '@angular/material';
import {FeedComponent} from './feed.component';
import {FormsModule} from '@angular/forms';
import {StateModule} from '../../store/state.module';
import {CardComponent} from './components/card/card.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatListModule,
    MatCardModule,
    MatButtonModule,

    StateModule
  ],
  declarations: [CardListComponent, FeedComponent, CardComponent],
  exports: [FeedComponent]
})
export class FeedModule {
}
