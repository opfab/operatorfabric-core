/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {LightCard, Severity} from '../src/domain/model/light-card.model';
import {CardOperation, CardOperationType} from '../src/domain/model/card-operation.model';

import {Card} from '../src/domain/model/card.model';
import {I18n} from '../src/domain/model/i18n.model';




// fully random without any control
export function getOneRandomAddCardOperation(): CardOperation {
    const numberOfCards = generateRandomPositiveIntegerWithinRangeWithOneAsMinimum(5);
    const now = new Date().getTime();
    return new CardOperation(
        generateRandomPositiveIntegerWithinRangeWithOneAsMinimum(768),
        now,
        CardOperationType.ADD,
        getSeveralRandomLightCards(numberOfCards)[0]
    );
}



export function getRandomIndex<E>(array: E[]) {
    if (array && array.length > 0) {
        return generateRandomPositiveIntegerWithinRangeWithOneAsMinimum(0, array.length);
    } else {
        return 0;
    }
}

export function getOneRandomLightCard(lightCardTemplate?: any): LightCard {
    lightCardTemplate = lightCardTemplate ? lightCardTemplate : {};
    const today = new Date().getTime();
    const startTime = today + generateRandomPositiveIntegerWithinRangeWithOneAsMinimum(1234);
    return new LightCard(
        getRandomAlphanumericValue(3, 24),
        lightCardTemplate.id ? lightCardTemplate.id : getRandomAlphanumericValue(3, 24),
        lightCardTemplate.publisher ? lightCardTemplate.publisher : 'testPublisher',
        lightCardTemplate.publisherVersion ? lightCardTemplate.publisherVersion : getRandomAlphanumericValue(3, 24),
        lightCardTemplate.publishDate ? lightCardTemplate.publishDate : today,
        lightCardTemplate.startDate ? lightCardTemplate.startDate : startTime,
        lightCardTemplate.endDate
            ? lightCardTemplate.endDate
            : startTime + generateRandomPositiveIntegerWithinRangeWithOneAsMinimum(3455),
        lightCardTemplate.expirationDate
            ? lightCardTemplate.expirationDate
            : startTime + generateRandomPositiveIntegerWithinRangeWithOneAsMinimum(3455),
        lightCardTemplate.severity ? lightCardTemplate.severity : getRandomSeverity(),
        lightCardTemplate.hasBeenAcknowledged ? lightCardTemplate.hasBeenAcknowledged : false,
        lightCardTemplate.hasBeenRead ? lightCardTemplate.hasBeenRead : false,
        lightCardTemplate.hasChildCardFromCurrentUserEntity
            ? lightCardTemplate.hasChildCardFromCurrentUserEntity
            : false,
        getRandomAlphanumericValue(3, 24),
        lightCardTemplate.lttd
            ? lightCardTemplate.lttd
            : generateRandomPositiveIntegerWithinRangeWithOneAsMinimum(4654, 5666),
        getRandomI18nData(),
        getRandomI18nData(),
        getRandomAlphanumericValue(3, 24),
        getRandomAlphanumericValue(3, 24),
        lightCardTemplate.tags ? lightCardTemplate.tags : null,
        lightCardTemplate.timeSpans ? lightCardTemplate.timeSpans : null,
        lightCardTemplate.rrule ? lightCardTemplate.rrule : null,
        lightCardTemplate.process ? lightCardTemplate.process : 'testProcess',
        lightCardTemplate.state ? lightCardTemplate.state : 'testState'
    );
}

export function getRandomSeverity(): Severity {
    const severities: Severity[] = [Severity.ALARM, Severity.ACTION, Severity.COMPLIANT, Severity.INFORMATION];
    return severities[getPositiveRandomNumberWithinRange(0, 3)];
}


export function getOneRandomCard(cardTemplate?: any): Card {
    cardTemplate = cardTemplate ? cardTemplate : {};
    const today = new Date().getTime();
    const startTime = today + generateRandomPositiveIntegerWithinRangeWithOneAsMinimum(1234);
    return new Card(
        getRandomAlphanumericValue(3, 24),
        cardTemplate.id ? cardTemplate.id : getRandomAlphanumericValue(3, 24),
        cardTemplate.publisher ? cardTemplate.publisher : getRandomAlphanumericValue(3, 24),
        cardTemplate.processVersion ? cardTemplate.processVersion : getRandomAlphanumericValue(3, 24),
        cardTemplate.publishDate ? cardTemplate.publishDate : today,
        cardTemplate.startDate ? cardTemplate.startDate : startTime,
        cardTemplate.endDate
            ? cardTemplate.endDate
            : startTime + generateRandomPositiveIntegerWithinRangeWithOneAsMinimum(3455),
        cardTemplate.expirationDate
            ? cardTemplate.expirationDate
            : startTime + generateRandomPositiveIntegerWithinRangeWithOneAsMinimum(3455),
        cardTemplate.severity ? cardTemplate.severity : getRandomSeverity(),
        false,
        false,
        false,
        cardTemplate.process ? cardTemplate.process : 'testProcess',
        cardTemplate.processInstanceId ? cardTemplate.processInstanceId : getRandomAlphanumericValue(3, 24),
        cardTemplate.state ? cardTemplate.state : getRandomAlphanumericValue(3, 24),
        cardTemplate.lttd ? cardTemplate.lttd : null,
        getRandomI18nData(),
        getRandomI18nData(),
        getRandomAlphanumericValue(3, 24),
        getRandomAlphanumericValue(3, 24),
        cardTemplate.data ? cardTemplate.data : {data: 'data'},
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        cardTemplate.entitiesAllowedToRespond ? cardTemplate.entitiesAllowedToRespond : null,
        cardTemplate.entitiesRequiredToRespond ? cardTemplate.entitiesRequiredToRespond : null,
        cardTemplate.entitiesAllowedToEdit ? cardTemplate.entitiesAllowedToEdit : null
    );
}



export function getSeveralRandomLightCards(numberOfCards = 1, cardTemplate?: any): LightCard[] {
    const finalNumberOfCards = forcePositiveAndOneMinimum(numberOfCards);
    const lightCards: LightCard[] = new Array(finalNumberOfCards);
    for (let i = 0; i < finalNumberOfCards; ++i) {
        lightCards[i] = getOneRandomLightCard(cardTemplate);
    }
    return lightCards;
}

export function getRandomI18nData(): I18n {
    const paramNumber = generateRandomPositiveIntegerWithinRangeWithOneAsMinimum(4);
    const parameters: Map<string, string> = new Map();
    for (let i = 0; i < paramNumber; ++i) {
        parameters[`param${i}`] = getRandomAlphanumericValue(4, 13);
    }
    return new I18n(getRandomAlphanumericValue(4, 7), parameters);
}

export function getRandomAlphanumericValue(min = 1, max?: number): string {
    const finalLength = getPositiveRandomNumberWithinRange(min, max);
    return getFixedLengthAlphanumericValue(finalLength);
}

export function getPositiveRandomNumberWithinRange(min = 1, max?: number): number {
    const minimum = forcePositiveAndOneMinimum(min);
    const maximum = handleMaxAgainstMin(minimum, max);
    return generateRandomPositiveIntegerWithinRangeWithOneAsMinimum(minimum, maximum);
}

export function generateRandomPositiveIntegerWithinRangeWithOneAsMinimum(min = 1, max = 1): number {
    const minimum = forcePositiveAndOneMinimum(min);
    const maximum = handleMaxAgainstMin(minimum, max);
    return Math.floor(Math.random() * (maximum - minimum) + minimum);
}

export function getRandomBoolean(): boolean {
    return Math.random() >= 0.5;
}

function forcePositiveAndOneMinimum(min: number): number {
    return min < 0 ? 1 : min;
}

function handleMaxAgainstMin(min: number, max?: number) {
    const minimum = forcePositiveAndOneMinimum(min);
    return !max || max < minimum ? minimum : max;
}

export function getFixedLengthAlphanumericValue(length = 1): string {
    const finalLength = forcePositiveAndOneMinimum(length);
    return appendFixedLengthAlphanumericValue(finalLength);
}

export function appendFixedLengthAlphanumericValue(length = 1, base = ''): string {
    const finalLength = forcePositiveAndOneMinimum(length);
    const numericBase = 36; // number as string encoded with all figures and all letters in lower case
    const indexOfTheRandomNumberToTrim0AndDot = 2; // random  numbers begin with '0.'
    const intermediateResult = Math.random().toString(numericBase).substring(indexOfTheRandomNumberToTrim0AndDot);

    const stringSize = intermediateResult.length;
    if (stringSize >= finalLength) {
        const remainingString = intermediateResult.substring(0, finalLength);
        return base + remainingString;
    } else {
        const nextLength = finalLength - stringSize;
        return base + appendFixedLengthAlphanumericValue(nextLength, intermediateResult);
    }
}

