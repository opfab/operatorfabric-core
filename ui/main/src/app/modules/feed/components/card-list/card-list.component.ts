/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {AfterViewInit, Component, Input} from '@angular/core';
import {LightCard} from '@ofModel/light-card.model';
import {Observable} from "rxjs";

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

    //Trigger resize event to make sure that height is calculated once parent height is available (see OC-362)
    if (typeof(Event) === 'function') {
      // modern browsers
      window.dispatchEvent(new Event('resize'));
    } else {
      // for IE and other old browsers
      // causes deprecation warning on modern browsers
      var evt = window.document.createEvent('UIEvents');
      evt.initUIEvent('resize', true, false, window, 0);
      window.dispatchEvent(evt);
    }
  }

}
