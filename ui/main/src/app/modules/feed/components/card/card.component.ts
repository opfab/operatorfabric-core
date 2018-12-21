/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {AfterContentInit, AfterViewInit, Component, Input, OnInit} from '@angular/core';
import {I18nData, LightCard} from '@ofModel/light-card.model';

@Component({
    selector: 'of-card',
    templateUrl: './card.component.html',
    styleUrls: ['./card.component.scss']
})
export class CardComponent {

   @Input() public lightCard: LightCard;
    constructor() {}

}
