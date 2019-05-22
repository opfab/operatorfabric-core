/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, OnInit } from '@angular/core';
import {IframeService} from "./iframe.service";
import {SafeUrl} from "@angular/platform-browser";

@Component({
  selector: 'of-iframedisplay',
  templateUrl: './iframedisplay.component.html',
  styleUrls: ['./iframedisplay.component.scss']
})
export class IframeDisplayComponent implements OnInit {

  iframeURL : SafeUrl;

  constructor(
      private iframeService : IframeService
  ) { }

  ngOnInit() {

    this.iframeService.urlUpdate.subscribe(
        iframeURL => this.setUrl(iframeURL)
    )
  }

  setUrl(iframeURL : SafeUrl){
    this.iframeURL = iframeURL;
  }

}
