/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Component, Input} from '@angular/core';
import {LightCard} from '../../../../state/light-card/light-card.model';

@Component({
  selector: 'app-cards-list',
  templateUrl: './light-cards-list.component.html',
  styleUrls: ['./light-cards-list.component.css']
})
export class LightCardsListComponent  {

  @Input() lightCards: LightCard[];

  constructor() { }


}
