/* Copyright (c) 2022-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

export default class ConnectionsStates {
    private consecutiveTimeNotConnected = new Map();
    private toSupervise = new Array();

    public setToSupervise(items: any) {
        this.toSupervise = items;
        this.consecutiveTimeNotConnected = new Map();
        this.toSupervise.forEach((item) => this.consecutiveTimeNotConnected.set(item, 0));
    }

    public setConnected(connected: any) {
        this.toSupervise.forEach((item) => {
            if (connected.includes(item)) this.consecutiveTimeNotConnected.set(item, 0);
            else {
                let nbDisconnect = this.consecutiveTimeNotConnected.get(item);
                this.consecutiveTimeNotConnected.set(item, nbDisconnect + 1);
            }
        });
    }

    public getNotConnectedForConsecutiveTimes(times: any):Array<string> {
        const notConnected = new Array();
        for (const entry of this.consecutiveTimeNotConnected.entries()) {
            const item = entry[0];
            const nb = entry[1];
            if (nb === times) notConnected.push(item);
        }
        return notConnected;
    }

    public reset() {
        this.toSupervise.forEach((item) => this.consecutiveTimeNotConnected.set(item, 0));
    }
}
