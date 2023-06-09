/* Copyright (c) 2022, Alliander (http://www.alliander.com)
 * Copyright (c) 2023, RTE (http://www.rte-france.com) 
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, Input, OnInit} from '@angular/core';
import {LightCard} from '@ofModel/light-card.model';
import {Observable} from 'rxjs';

@Component({
    selector: 'of-grouped-card-list',
    templateUrl: './grouped-card-list.component.html',
    styleUrls: ['./grouped-card-list.component.scss']
})
export class GroupedCardListComponent implements OnInit {

    @Input() public lightCards: LightCard[];
    @Input() public selection: Observable<string>;

    maxVisibleCards = 100;
    visibleCards: LightCard[];

    ngOnInit(): void {
        this.setVisibleGroupedCards();
    }

    private setVisibleGroupedCards() {
        if (this.lightCards) {
            this.visibleCards = [];
            if (this.lightCards.length > this.maxVisibleCards) {
                this.visibleCards = this.lightCards.slice(0, this.maxVisibleCards);
            } else this.visibleCards = this.lightCards;
        }
    }
}
