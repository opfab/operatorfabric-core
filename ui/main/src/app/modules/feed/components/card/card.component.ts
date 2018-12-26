/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Component, Input} from '@angular/core';
import {LightCard} from '@ofModel/light-card.model';
import {Router} from "@angular/router";

@Component({
    selector: 'of-card',
    templateUrl: './card.component.html',
    styleUrls: ['./card.component.scss']
})
export class CardComponent {

    open: boolean = false;

    @Input() public lightCard: LightCard;

    constructor(private router: Router) {
    }

    public select() {
        this.router.navigate(['/feed','cards',this.lightCard.id]);
    }

}
