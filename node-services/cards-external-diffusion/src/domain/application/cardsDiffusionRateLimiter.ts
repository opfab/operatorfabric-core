/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


export default class CardsDiffusionRateLimiter {

    private sendRateLimit: number = 100;
    private limitPeriodInSec: number = 3600;

    private sentMailPerDestination = new Map();

    public setSendRateLimit(limit: number) {
        this.sendRateLimit = limit;
        return this;
    }

    public setLimitPeriodInSec(period: number) {
        this.limitPeriodInSec = period;
        return this;
    }

    public isNewSendingAllowed(destination: string) {
        const sentMails = this.getSentMails(destination);
        return !this.isLimitReached(sentMails);
    }

    public registerNewSending(destination: string) {
        const sentMails = this.getSentMails(destination);
        const now = Date.now();
        sentMails.push(now);
        if (sentMails.length > this.sendRateLimit)
            sentMails.splice(0);
    }

    private getSentMails(destination: string) {
        if (!this.sentMailPerDestination.has(destination))
            this.sentMailPerDestination.set(destination, []);
        return this.sentMailPerDestination.get(destination);
    }


    private isLimitReached(sentMails: number[]) {
        if (sentMails.length == this.sendRateLimit) {
            const timeSinceOldestSending = Date.now() - sentMails[0];
            if (timeSinceOldestSending <= this.limitPeriodInSec * 1000)
                return true;
        }
        return false;
    }


}
