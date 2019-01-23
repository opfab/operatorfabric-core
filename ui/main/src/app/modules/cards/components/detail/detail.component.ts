/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Component, Input, OnInit} from '@angular/core';
import {Card, CardDetail} from '@ofModel/card.model';
import {ThirdsService} from "../../services/thirds.service";
import {HandlebarsService} from "../../services/handlebars.service";

@Component({
  selector: 'of-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css']
})
export class DetailComponent implements OnInit {
  public active = false;
  @Input() detail: CardDetail;
  @Input() card: Card;
  private _htmlContent: string;

  constructor(private thirds: ThirdsService,
              private handlebars: HandlebarsService) { }

  ngOnInit() {
    this.thirds.init();
    this.handlebars.executeTemplate(this.detail.templateName,this.card).subscribe(html=>this._htmlContent=html);
  }

  get htmlContent(){
    return this._htmlContent;
  }

}
