/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {AfterViewInit, Component, Input} from '@angular/core';
import {LightCard} from '@ofModel/light-card.model';
import {Observable} from "rxjs";
import { InitResize } from 'app/util/init-resize';

@Component({
  selector: 'of-card-list',
  templateUrl: './card-list.component.html',
  styleUrls: ['./card-list.component.scss']
})
export class CardListComponent implements AfterViewInit {

  @Input() public lightCards: LightCard[];
  @Input() public selection: Observable<string>;

  constructor() { }


  ngAfterViewInit() {
    new InitResize().initResizeHeight();
  }

}
