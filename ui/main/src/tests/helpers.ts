import {I18nData, LightCard, Severity} from '@state/light-card/light-card.model';
import {generate} from 'rxjs';
//
// export function getNewLightCardInstance(): LightCard{
//     return new LightCard();
// }
//
// export function getNewI8nDataInstance(): I18nData{
//     return new I18nData();
// }



export function    getRandomLigthCard(): LightCard {
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
}


export function getRandomI18nData(): I18nData {
    const paramNumber = generateRandomPositiveIntegerWithinRangeWithOneAsMinimum(4);
    const parameters: string[] = new Array(paramNumber);
    for (let i = 0; i < paramNumber; ++i) {
        parameters[i] = getRandomAlphanumericValue(4, 13);
    }
    return new I18nData(getRandomAlphanumericValue(4, 7), parameters);
}

export enum LightCardAttribute {
    id, uid, startDate,
}

export function getRandomAlphanumericValue(min = 1, max?: number): string {
    const minimum = forcePositiveAndOneMinimum(min);
    const maximum = handleMaxAgainstMin(minimum, max);
    const finalLength = generateRandomPositiveIntegerWithinRangeWithOneAsMinimum(minimum, maximum);
    return getFixedLengthAlphanumericValue(finalLength);
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
