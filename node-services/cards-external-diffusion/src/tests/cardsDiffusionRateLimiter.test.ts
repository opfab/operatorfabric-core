/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import 'jest';
import CardsDiffusionRateLimiter from '../domain/application/cardsDiffusionRateLimiter';

describe('Cards external diffusion', function () {
    beforeEach(() => {
        jest.useFakeTimers();
        setCurrentTime('2017-01-01 01:00');
    });

    function setCurrentTime(dateTime: string): void {
        jest.setSystemTime(new Date(dateTime));
    }

    it('Should not allow to send card when limit is reached for a destination', async function () {
        const cardsDiffusionRateLimiter = new CardsDiffusionRateLimiter().setLimitPeriodInSec(10).setSendRateLimit(2);

        expect(cardsDiffusionRateLimiter.isNewSendingAllowed('destination1')).toBeTruthy();

        cardsDiffusionRateLimiter.registerNewSending('destination1');
        expect(cardsDiffusionRateLimiter.isNewSendingAllowed('destination1')).toBeTruthy();
        cardsDiffusionRateLimiter.registerNewSending('destination1');
        expect(cardsDiffusionRateLimiter.isNewSendingAllowed('destination1')).toBeFalsy();

        expect(cardsDiffusionRateLimiter.isNewSendingAllowed('destination2')).toBeTruthy();
    });

    it('When count limit is reached should allow to send card only after time limit period', async function () {
        const cardsDiffusionRateLimiter = new CardsDiffusionRateLimiter()
            .setLimitPeriodInSec(30 * 60)
            .setSendRateLimit(1);

        jest.useFakeTimers();
        setCurrentTime('2017-01-01 01:00');

        expect(cardsDiffusionRateLimiter.isNewSendingAllowed('destination1')).toBeTruthy();
        cardsDiffusionRateLimiter.registerNewSending('destination1');
        expect(cardsDiffusionRateLimiter.isNewSendingAllowed('destination1')).toBeFalsy();

        setCurrentTime('2017-01-01 01:29');
        expect(cardsDiffusionRateLimiter.isNewSendingAllowed('destination1')).toBeFalsy();

        setCurrentTime('2017-01-01 01:31');
        expect(cardsDiffusionRateLimiter.isNewSendingAllowed('destination1')).toBeTruthy();
    });
});
