/* Copyright (c) 2022-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {OpfabEventStreamServer} from '@ofServices/events/server/OpfabEventStreamServer';
import {NgIf} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';

@Component({
    selector: 'of-connection-lost',
    styleUrls: ['./connection-lost.component.scss'],
    templateUrl: './connection-lost.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgIf, TranslateModule]
})
export class ConnectionLostComponent implements OnInit {
    connectionLostForMoreThanTenSeconds = false;
    connectionLost = false;
    previousStatus = '';

    constructor(
        private readonly opfabEventStreamServer: OpfabEventStreamServer,
        private readonly changeDetector: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.detectConnectionLost();
    }

    private detectConnectionLost() {
        this.opfabEventStreamServer.getStreamStatus().subscribe((status) => {
            if (status !== this.previousStatus) {
                this.previousStatus = status;
                this.connectionLostForMoreThanTenSeconds = false;
                this.connectionLost = status !== 'open';
                // Wait 10s before showing "connection lost" to the user to avoid alerting on short connection loss
                if (this.connectionLost)
                    setTimeout(() => {
                        if (this.connectionLost) this.connectionLostForMoreThanTenSeconds = true;
                        this.changeDetector.markForCheck();
                    }, 10000);
                this.changeDetector.markForCheck();
            }
        });
    }
}
