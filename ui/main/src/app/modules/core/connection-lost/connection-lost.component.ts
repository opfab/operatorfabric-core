/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {selectSubscriptionOpen} from '@ofStore/selectors/cards-subscription.selectors';


@Component({
    selector: 'of-connection-lost',
    styleUrls: ['./connection-lost.component.scss'],
    templateUrl: './connection-lost.component.html'
})
export class ConnectionLostComponent implements OnInit {

    connectionLostForMoreThanTenSeconds = false;
    connectionLost = false;

    constructor(private store: Store) {
    }

    ngOnInit(): void {
        this.detectConnectionLost();

    }

    private detectConnectionLost() {
        this.store.select(selectSubscriptionOpen).subscribe((subscriptionOpen) => {
            this.connectionLostForMoreThanTenSeconds = false;
            this.connectionLost = !subscriptionOpen;
            // Wait 10s before showing "connection lost" to the user to avoid alerting on short connection loss
            if (this.connectionLost)
                setTimeout(() => {
                    if (this.connectionLost) this.connectionLostForMoreThanTenSeconds = true;
                }, 10000);
        });
    }
}