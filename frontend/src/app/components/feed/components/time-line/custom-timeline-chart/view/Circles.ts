/* Copyright (c) 2018-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {getNextTimeForRepeating as getNextTimeForRepeatingUsingRRule} from '@ofServices/reminder/RruleReminderUtils';
import {add, format} from 'date-fns';

export class Circle {
    public start: number;
    public date: Date;
    public count: number;
    public width: number;
    public color: string;
    public circleYPosition: number;
    public summary: SummaryLine[];
}

export class SummaryLine {
    public cardId: string;
    public titleTranslated: string;
    public summaryDate: string;
}
export class Circles {
    public circles: Circle[] = [];
    private cardsForTimeLine;
    private xTicks: Array<Date>;
    private gridTimeDomain: Array<number>;
    private cardsTimeDomain: any;

    public setDomain(cardsTimeDomain: any, gridTimeDomain: Array<number>, xTicks: Array<Date>): void {
        this.gridTimeDomain = gridTimeDomain;
        this.cardsTimeDomain = cardsTimeDomain;
        this.xTicks = xTicks;
        this.createCircles();
    }

    public setCardsToDrawOnTimeLine(cards) {
        const newCardsForTimeline = [];
        for (const card of cards) {
            if (!card.parentCardId) {
                // is not child card
                if (card.rRule) {
                    this.computeCardWithRRuleForTimeLine(card, newCardsForTimeline);
                } else if (card.timeSpans && card.timeSpans.length > 0) {
                    card.timeSpans.forEach((timeSpan) => {
                        this.computeCardForTimeLine(card, timeSpan, newCardsForTimeline);
                    });
                } else {
                    this.computeCardForTimeLine(card, null, newCardsForTimeline);
                }
            }
        }
        this.cardsForTimeLine = newCardsForTimeline;
        this.createCircles();
    }

    private computeCardWithRRuleForTimeLine(card: any, newCardsForTimeline: any[]) {
        let dateForReminder: number = getNextTimeForRepeatingUsingRRule(
            card,
            this.gridTimeDomain[0].valueOf() + 1000 * card.secondsBeforeTimeSpanForReminder
        );

        while (
            dateForReminder >= 0 &&
            (!card.endDate || dateForReminder < card.endDate) &&
            dateForReminder < this.gridTimeDomain[1].valueOf()
        ) {
            newCardsForTimeline.push({
                date: dateForReminder,
                id: card.id,
                severity: card.severity,
                titleTranslated: card.titleTranslated
            });
            const nextDate = add(dateForReminder, {minutes: 1});

            dateForReminder = getNextTimeForRepeatingUsingRRule(
                card,
                nextDate.valueOf() + 1000 * card.secondsBeforeTimeSpanForReminder
            );
        }
    }

    private computeCardForTimeLine(card: any, timeSpan: any, newCardsForTimeline: any[]) {
        const startDate = timeSpan ? timeSpan.start : card.startDate;
        if (startDate) {
            newCardsForTimeline.push({
                date: startDate,
                id: card.id,
                severity: card.severity,
                titleTranslated: card.titleTranslated
            });
        }
    }

    private createCircles(): void {
        if (this.cardsForTimeLine === undefined) {
            return;
        }
        // filter cards by date
        this.cardsForTimeLine.sort((val1, val2) => {
            return val1.date - val2.date;
        });
        const cardsDataBySeverity = this.separateCardsDataBySeverity();

        // for each severity create the circles
        this.circles = [];
        for (const cardsData of cardsDataBySeverity) {
            let cardIndex = this.getIndexOfFirstCardInTimeDomain(cardsData);
            if (cardIndex < cardsData.length) {
                for (let tickIndex = 1; tickIndex < this.xTicks.length; tickIndex++) {
                    cardIndex = this.createCircleForTick(tickIndex, cardsData, cardIndex);
                }
            }
        }
    }
    private createCircleForTick(tickIndex: number, cardsData: any, cardIndex: number) {
        let endLimit = this.xTicks[tickIndex].valueOf();

        if (tickIndex + 1 === this.xTicks.length) {
            endLimit += 1; // Include the limit domain value by adding 1ms
        }

        if (cardsData[cardIndex] && cardsData[cardIndex].date < endLimit) {
            const circle: Circle = {
                start: cardsData[cardIndex].date,
                date: this.xTicks[tickIndex - 1],
                count: 0,
                width: 10,
                color: this.getCircleColor(cardsData[cardIndex].severity),
                circleYPosition: cardsData[cardIndex].circleYPosition,
                summary: []
            };

            // while cards date is inside the interval of the two current ticks, add card information in the circle
            while (cardsData[cardIndex] && cardsData[cardIndex].date < endLimit) {
                circle.count++;
                const summary = new SummaryLine();
                summary.cardId = cardsData[cardIndex].id;
                summary.titleTranslated = cardsData[cardIndex].titleTranslated;
                summary.summaryDate = format(cardsData[cardIndex].date, 'dd/MM - HH:mm :');
                circle.summary.push(summary);
                cardIndex++;
            }
            circle.width = 10 + 2 * this.getEllipseWidth(circle.count);

            this.circles.push(circle);
        }
        return cardIndex;
    }

    private separateCardsDataBySeverity() {
        const cardsDataBySeverity = [];
        for (let i = 0; i < 4; i++) {
            cardsDataBySeverity.push([]);
        }
        for (const card of this.cardsForTimeLine) {
            card.circleYPosition = this.getCircleYPosition(card.severity);
            cardsDataBySeverity[card.circleYPosition - 1].push(card);
        }
        return cardsDataBySeverity;
    }

    private getIndexOfFirstCardInTimeDomain(cards: any) {
        let cardIndex = 0;
        if (cards.length > 0) {
            while (
                cards[cardIndex] &&
                cards[cardIndex].date < this.cardsTimeDomain.startDate &&
                cardIndex < cards.length
            ) {
                cardIndex++;
            }
        }
        return cardIndex;
    }

    private getCircleYPosition(severity: string): number {
        switch (severity) {
            case 'ALARM':
                return 4;
            case 'ACTION':
                return 3;
            case 'COMPLIANT':
                return 2;
            case 'INFORMATION':
                return 1;
            default:
                return 1;
        }
    }

    private getCircleColor(severity: string): string {
        switch (severity) {
            case 'ALARM':
                return '#A71A1A'; // red
            case 'ACTION':
                return '#FD9313'; // orange
            case 'COMPLIANT':
                return '#00BB03'; // green
            case 'INFORMATION':
                return '#1074AD'; // blue
            default:
                return '#1074AD';
        }
    }

    private getEllipseWidth(count: number) {
        return (Math.log(count) * Math.LOG10E) | 0;
    }
}
