/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Component, Input, OnInit} from '@angular/core';
import {CardOperation} from "../../../state/card-operation/card-operation.model";

@Component({
  selector: 'app-card-operation-details',
  templateUrl: './card-operation-details.component.html',
  styleUrls: ['./card-operation-details.component.css']
})
export class CardOperationDetailsComponent implements OnInit {

@Input() cardOperation: CardOperation;

  constructor() { }

  ngOnInit() {
  }

}
