/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {I18nData, LightCard, Severity} from '@ofModel/light-card.model';
import {CardOperation, CardOperationType} from '@ofModel/card-operation.model';
//
// export function getNewLightCardInstance(): LightCard{
//     return new LightCard();
// }
//
// export function getNewI8nDataInstance(): I18nData{
//     return new I18nData();
// }

// completemet aléatoire sans control
export function getOneRandomAddCardOperation(): CardOperation {
    const numberOfCards = generateRandomPositiveIntegerWithinRangeWithOneAsMinimum(5);
    const now = new Date().getTime();
    return new CardOperation(
        generateRandomPositiveIntegerWithinRangeWithOneAsMinimum(768),
        now,
        CardOperationType.ADD,
        getSeveralRandomLightCards(numberOfCards)
    );
}

// export function pickARandomItemOfAnEnum<E>(enumeration: any): E {
//     const keys = Object.keys(enumeration);
//     const numberOfEnumItems = keys.length;
//     const randomIndex = generateRandomPositiveIntegerWithinRangeWithOneAsMinimum(numberOfEnumItems);
//     return <E>keys[randomIndex];
// }

export function getOneRandomLigthCard(): LightCard {
    const today = new Date().getTime();
    const startTime = today + generateRandomPositiveIntegerWithinRangeWithOneAsMinimum(1234);
    const oneCard = new LightCard(getRandomAlphanumericValue(3, 24)
        , getRandomAlphanumericValue(3, 24)
        , startTime
        , startTime + generateRandomPositiveIntegerWithinRangeWithOneAsMinimum(3455)
        , Severity.QUESTION
        , getRandomAlphanumericValue(3, 24)
        , getRandomAlphanumericValue(3, 24)
        , generateRandomPositiveIntegerWithinRangeWithOneAsMinimum(4654, 5666)
        , getRandomI18nData()
        , getRandomI18nData()
    );
    return oneCard;
}

export function getSeveralRandomLightCards(numberOfCards = 1): LightCard[] {
    const finalNumberOfCards = forcePositiveAndOneMinimum(numberOfCards);
    const lightCards: LightCard[] = new Array(finalNumberOfCards);
    for (let i = 0; i < finalNumberOfCards; ++i) {
        lightCards[i] = getOneRandomLigthCard();
    }
    return lightCards;
}


export function getRandomI18nData(): I18nData {
    const paramNumber = generateRandomPositiveIntegerWithinRangeWithOneAsMinimum(4);
    const parameters: string[] = new Array(paramNumber);
    for (let i = 0; i < paramNumber; ++i) {
        parameters[i] = getRandomAlphanumericValue(4, 13);
    }
    return new I18nData(getRandomAlphanumericValue(4, 7), parameters);
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

export function generateRandomPositiveIntegerWithinRangeWithOneAsMinimum(min = 1, max = 1) {
    const minimum = forcePositiveAndOneMinimum(min);
    const maximum = handleMaxAgainstMin(minimum, max);
    return Math.floor(Math.random() * (maximum - minimum) + minimum);
}

function forcePositiveAndOneMinimum(min: number): number {
    const result = (min < 0) ? 1 : min;
    return result;
}

function handleMaxAgainstMin(min: number, max: number) {
    const minimum = forcePositiveAndOneMinimum(min);
    const result = (!max || max < minimum) ? minimum : max;
    return result;
}

export function getFixedLengthAlphanumericValue(length = 1): string {
    const finalLength = forcePositiveAndOneMinimum(length);
    return appendFixedLengthAlphanumericValue(finalLength);
}

export function appendFixedLengthAlphanumericValue(length = 1, base = ''): string {
    const finalLength = forcePositiveAndOneMinimum(length);
    const numericBase = 36; // number as string encoded with all figures and all letters in lower case
    const indexOfTheRandomNumberToTrim0AndDot = 2; // random  numbers begin with '0.'
    const intermediateResult = Math.random()
        .toString(numericBase)
        .substr(indexOfTheRandomNumberToTrim0AndDot);

    const stringSize = intermediateResult.length;
    if (stringSize >= finalLength) {
        const remainingString = intermediateResult.substr(0, finalLength);
        return base + remainingString;
    } else {
        const nextLength = finalLength - stringSize;
        return base + appendFixedLengthAlphanumericValue(nextLength, intermediateResult);
    }
}
