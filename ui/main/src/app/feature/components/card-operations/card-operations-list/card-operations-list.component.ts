/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Component, Input, OnInit} from '@angular/core';
import {CardOperation} from "@state/card-operation/card-operation.model";

@Component({
  selector: 'app-card-operations-list',
  templateUrl: './card-operations-list.component.html',
  styleUrls: ['./card-operations-list.component.css']
})
export class CardOperationsListComponent implements OnInit {

  @Input() cardOperations: CardOperation[];

  constructor() { }

  ngOnInit() {
  }

}
