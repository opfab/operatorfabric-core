/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.publication.ratelimiter;

import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;

public class CardSendingLimiter {

    private final int limitCardCount;
    private final int limitPeriodInSec;
    private CustomClock customClock;
    private Map<String, List<Long>> publisherData = new HashMap<>();

    public CardSendingLimiter(int limitCardCount, int limitPeriodInSec) {
        this(limitCardCount, limitPeriodInSec, new DefaultClock());
    }

    public CardSendingLimiter(int limitCardCount, int limitPeriodInSec, CustomClock customClock) {
        this.limitCardCount = limitCardCount;
        this.limitPeriodInSec = limitPeriodInSec;
        this.customClock = customClock;
    }

    public boolean isNewSendingAllowed(String login) {
        List<Long> cardSendings = getCardSendings(login.toUpperCase());

        if (!isLimitReached(cardSendings)) {
            registerNewSending(cardSendings);
            return true;
        }
        else
            return false;
    }

    private List<Long> getCardSendings(String login) {
        return publisherData.computeIfAbsent(login, k -> new ArrayList<>());
    }

    private boolean isLimitReached(List<Long> cardSendings) {
        if (cardSendings.size() == limitCardCount) {
            long timeSinceOldestSending = customClock.millis() - cardSendings.get(0);
            if (timeSinceOldestSending <= limitPeriodInSec * 1000)
                return true;
        }
        return false;
    }

    private void registerNewSending(List<Long> cardSendings) {
        cardSendings.add(customClock.millis());
        if(cardSendings.size() > limitCardCount)
            cardSendings.remove(0);
    }
}
