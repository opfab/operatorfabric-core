/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Component, Input, OnInit} from '@angular/core';
import {Card, CardDetail} from '@ofModel/card.model';

@Component({
  selector: 'of-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css']
})
export class DetailComponent implements OnInit {
  public active = false;
  @Input() detail: CardDetail;
  @Input() card: Card;

  constructor() { }

  ngOnInit() {
  }

}
