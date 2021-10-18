/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



import {Severity} from "@ofModel/light-card.model";
import {getOneRandomLightCard} from "@tests/helpers";
import {
    compareByPublishDate,
    compareByReadPublishDate,
    compareByReadSeverityPublishDate,
    compareBySeverity, compareBySeverityPublishDate,
    compareByStartDate
} from "@ofServices/lightcards-feed-filter.service";

describe('FeedState', () => {
    const card1 = getOneRandomLightCard({startDate:5000, severity:Severity.INFORMATION, lttd:10000, publishDate:5000, hasBeenRead: true });
    const card2 = getOneRandomLightCard({startDate:10000, severity: Severity.ALARM, lttd:5000, publishDate:10000, hasBeenRead: false});
    const card3 = getOneRandomLightCard({startDate:10000, severity: Severity.INFORMATION, lttd:10000, publishDate:10000, hasBeenRead: false});
    const card4 = getOneRandomLightCard({startDate:10000, severity: Severity.ALARM, lttd:10000, publishDate:5000, hasBeenRead: true});
    const card5 = getOneRandomLightCard({startDate:10000, severity: Severity.ALARM, lttd:10000, publishDate:6000, hasBeenRead: true});

    describe('#compareByStartDate', () => {
        it('should sort', () => {
            expect(compareByStartDate(card1,card2)).toBeLessThan(0);
        });
    });
    describe('#compareBySeverity', () => {
        it('should sort', () => {
            expect(compareBySeverity(card1,card2)).toBeGreaterThan(0);
        });
    });
    describe('#compareByPublishDate', () => {
        it('should sort', () => {
            expect(compareByPublishDate(card1,card2)).toBeGreaterThan(0);
        });
    });
    describe('#compareBySeverityPublishDate', () => {
        it('should sort', () => {
            expect(compareBySeverityPublishDate(card1,card2)).toBeGreaterThan(0); //Different severities
            expect(compareBySeverityPublishDate(card1,card3)).toBeGreaterThan(0); //Same severities, different publishDate
            expect([card1,card2,card3,card4].sort(compareBySeverityPublishDate)).toEqual([card2,card4,card3,card1])
        });
    });

    describe('#compareByReadPublishDate', () => {
        it('should sort', () => {
            expect(compareByReadPublishDate(card1,card2)).toBeGreaterThan(0);
        });
    });
    describe('#compareByReadSeverityPublishDate', () => {
        it('should sort', () => {
            expect(compareByReadSeverityPublishDate(card1,card2)).toBeGreaterThan(0); //Different read state
            expect(compareByReadSeverityPublishDate(card1,card4)).toBeGreaterThan(0); //Same readState, different severity
            expect(compareByReadSeverityPublishDate(card4,card5)).toBeGreaterThan(0); //Same readState, same severity, different publishDate
            expect([card1,card2,card3,card4,card5].sort(compareByReadSeverityPublishDate)).toEqual([card2,card3,card5,card4,card1]);
        });
    });
});
