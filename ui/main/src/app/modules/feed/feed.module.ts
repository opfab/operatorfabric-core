/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CardListComponent} from './components/card-list/card-list.component';
import {FeedComponent} from './feed.component';
import {FormsModule} from '@angular/forms';
import {FeedRoutingModule} from "./feed-routing.module";
import {NoSelectionComponent} from './components/no-selection/no-selection.component';
import {TimeLineComponent} from './components/time-line/time-line.component';
import {CardsModule} from "../cards/cards.module";


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    CardsModule,
    FeedRoutingModule,
  ],
  declarations: [CardListComponent, FeedComponent, NoSelectionComponent, TimeLineComponent],
  exports: [FeedComponent]
})
export class FeedModule {
}
