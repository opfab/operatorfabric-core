/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Component, Input, OnInit} from '@angular/core';
import {LightCard} from '@ofModel/light-card.model';
import {Observable} from 'rxjs';
import { ResizableComponent } from 'app/modules/utilities/components/resizable/resizable.component';
import { Store } from '@ngrx/store';
import { AppState } from '@ofStore/index';
import { selectCurrentUrl } from '@ofStore/selectors/router.selectors';
import { AddActionsAppear } from '@ofStore/actions/card.actions';

@Component({
  selector: 'of-card-list',
  templateUrl: './card-list.component.html',
  styleUrls: ['./card-list.component.scss']
})
export class CardListComponent extends ResizableComponent implements OnInit {

  @Input() public lightCards: LightCard[];
  @Input() public selection: Observable<string>;

  constructor(private store: Store<AppState>) {
    super();
  }

  ngOnInit(): void {
    this.store.select(selectCurrentUrl).subscribe(url => {
      if (url) {
          const urlParts = url.split('/');
          if (urlParts[3]) {
              this.store.dispatch(new AddActionsAppear(urlParts[3]));
          }
      }
    });
  }
}
