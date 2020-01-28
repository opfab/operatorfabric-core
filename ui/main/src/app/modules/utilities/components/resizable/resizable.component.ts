/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, AfterViewInit, HostListener } from '@angular/core';

@Component({
  selector: 'of-resizable',
  templateUrl: './resizable.component.html',
  styleUrls: ['./resizable.component.css']
})
export class ResizableComponent implements AfterViewInit {

  resized: boolean;
  constructor() { }
  ngAfterViewInit() {
    // Trigger resize event to make sure that height is calculated once parent height is available (see OC-362)
    if (typeof(Event) === 'function') {
      // modern browsers
      window.dispatchEvent(new Event('resize'));
    } else {
      // for IE and other old browsers
      // causes deprecation warning on modern browsers
      const evt = window.document.createEvent('UIEvents');
      evt.initUIEvent('resize', true, false, window, 0);
      window.dispatchEvent(evt);
    }
  }

  @HostListener('window:resize')
  onResize() {
    this.resized = true;
  }

}


