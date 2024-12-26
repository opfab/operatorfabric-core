/* Copyright (c) 2023-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Card, TimeSpan} from '../model/card.model';

export function getNextTimeForRepeating(card: Card, startingDate?: number): number {
    if (card.timeSpans != null) {
        let nextTime = -1;

        card.timeSpans.forEach((timeSpan) => {
            const timeForRepeating = getNextTimeForRepeatingFromTimeSpan(timeSpan, startingDate);
            if (timeForRepeating !== -1) {
                if (nextTime === -1 || timeForRepeating < nextTime) nextTime = timeForRepeating;
            }
        });
        if (card.endDate != null && nextTime > card.endDate) return -1;
        return nextTime;
    }
    return -1;
}

function getNextTimeForRepeatingFromTimeSpan(timeSpan: TimeSpan, startingDate?: number): number {
    if (startingDate == null) {
        startingDate = new Date().valueOf();
    }

    if (timeSpan.start < startingDate) {
        return -1;
    } else {
        return timeSpan.start;
    }
}
