/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.publication.ratelimiter;

import org.junit.jupiter.api.*;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;

class CardSendingLimiterShould {

    private TestClock testClock;
    private CardSendingLimiter limiter;
    private final int limitCardCount = 5;
    private final int limitPeriodInSec = 60;

    @BeforeEach
    public void init() {
        testClock = new TestClock(Clock.fixed(Instant.parse("2001-06-09T00:00:00.00Z"), ZoneId.systemDefault()));
        limiter = new CardSendingLimiter(limitCardCount, limitPeriodInSec, testClock);
    }

    @Test
    void isPermissionRefusedWhenLimitReached() {
        for (int i=0; i<limitCardCount; i++) {
            limiter.isNewSendingAllowed("publisher1");
        }

        Assertions.assertFalse(limiter.isNewSendingAllowed("PUBLISHER1"));
    }

    @Test
    void isPermissionAcceptedWhenWaitAfterLimitReached() {
        for (int i=0; i<limitCardCount; i++) {
            limiter.isNewSendingAllowed("publisher1");
        }

        testClock.offset(Duration.ofSeconds(61));
        Assertions.assertTrue(limiter.isNewSendingAllowed("PUBLISHER1"));
    }

    @Test
    void multiplePublishers() {
        for (int i=0; i<limitCardCount; i++) {
            limiter.isNewSendingAllowed("publisher1");
        }
        testClock.offset(Duration.ofSeconds(30));
        Assertions.assertFalse(limiter.isNewSendingAllowed("PUBLISHER1"));

        for (int i=0; i<limitCardCount; i++) {
            limiter.isNewSendingAllowed("publisher2");
        }
        testClock.offset(Duration.ofSeconds(31));
        Assertions.assertFalse(limiter.isNewSendingAllowed("PUBLISHER2"));
        Assertions.assertTrue(limiter.isNewSendingAllowed("PUBLISHER1"));

        testClock.offset(Duration.ofSeconds(30));
        Assertions.assertTrue(limiter.isNewSendingAllowed("PUBLISHER2"));
    }
}
