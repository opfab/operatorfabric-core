/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {LightCard, Severity} from '@ofModel/light-card.model';
import {CardOperation, CardOperationType} from '@ofModel/card-operation.model';
import {Action, ActionType, Card, CardDetail, TitlePosition} from "@ofModel/card.model";
import {I18n} from "@ofModel/i18n.model";
import {Map} from "@ofModel/map";
import {Third, ThirdMenu, ThirdMenuEntry} from "@ofModel/thirds.model";

export function getRandomMenu(): ThirdMenu[] {
    let result: ThirdMenu[] = [];
    let menuCount = getPositiveRandomNumberWithinRange(2,4);
    for (let i=0;i<menuCount;i++){
        let entries:ThirdMenuEntry[]=[];
        let entryCount = getPositiveRandomNumberWithinRange(2,5);
        for(let j=0;j<entryCount;j++){
            entries.push(new ThirdMenuEntry(
                getRandomAlphanumericValue(3,10),
                getRandomAlphanumericValue(3,10),
                getRandomAlphanumericValue(3,10)
                )
            )
        }
        result.push(new ThirdMenu(
            getRandomAlphanumericValue(3,10),
            getRandomAlphanumericValue(3,10),
            getRandomAlphanumericValue(3,10),
            entries))
    }
    return result;
}

export function getRandomThird(): Third[] {
    let result: Third[] = [];
    let thirdCount = getPositiveRandomNumberWithinRange(1,3);
    for (let i=0;i<thirdCount;i++){
        let entries:ThirdMenuEntry[]=[];
        let entryCount = getPositiveRandomNumberWithinRange(1,3);
        for(let j=0;j<entryCount;j++){
            entries.push(new ThirdMenuEntry(
                getRandomAlphanumericValue(3,10),
                getRandomAlphanumericValue(3,10),
                getRandomAlphanumericValue(3,10)
            ))
        }
        result.push(new Third(
            getRandomAlphanumericValue(3,10),
            getRandomAlphanumericValue(3,10),
            getRandomAlphanumericValue(3,10),
            undefined,
            undefined,
            undefined,
            entries))
    }
    return result;
}

//
// export function getNewLightCardInstance(): LightCard{
//     return new LightCard();
// }
//
// export function getNewI8nDataInstance(): I18nData{
//     return new I18nData();
// }

// fully random without any control
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
//heavily based on enum implementation
export function  pickARandomItemOfAnEnum<E>(currentEnum:E):E {
    const keys = Object.keys(currentEnum).filter(k=>{
        let parsedInt = parseInt(k)
        let isNum = !isNaN(parsedInt);
        return isNum;
    });
    const randomIndex = getRandomIndex(keys);
    let key = keys[randomIndex];
    return currentEnum[key];
}


export function getRandomIndex<E>(array: E[]){
    if(array && array.length >0){
    return generateRandomPositiveIntegerWithinRangeWithOneAsMinimum(0,array.length);
    }else{
        return 0;
    }
}

export function getOneRandomLigthCard(card?:any): LightCard {
    card = card?card:{};
    const today = new Date().getTime();
    const startTime = today + generateRandomPositiveIntegerWithinRangeWithOneAsMinimum(1234);
    const oneCard = new LightCard(getRandomAlphanumericValue(3, 24),
        card.id?card.id:getRandomAlphanumericValue(3, 24),
        card.publisher?card.publisher:'testPublisher',
        card.publisherVersion? card.publisherVersion:getRandomAlphanumericValue(3, 24),
        card.publishDate?card.publishDate:today,
        card.startDate? card.startDate:startTime,
        card.endDate?card.endDate:startTime + generateRandomPositiveIntegerWithinRangeWithOneAsMinimum(3455),
        card.severity?card.severity:Severity.QUESTION,
        getRandomAlphanumericValue(3, 24),
        getRandomAlphanumericValue(3, 24),
        generateRandomPositiveIntegerWithinRangeWithOneAsMinimum(4654, 5666),
        getRandomI18nData(),
        getRandomI18nData(),
    );
    return oneCard;
}

export function getOneRandomCard(card?:any): Card {
    card = card?card:{};
    const today = new Date().getTime();
    const startTime = today + generateRandomPositiveIntegerWithinRangeWithOneAsMinimum(1234);
    let actions:Map<Action> = new Map();
    actions['visible1']= new Action(ActionType.URI,getRandomI18nData());
    actions['visible2']= new Action(ActionType.URI,getRandomI18nData());
    actions['hidden1']= new Action(ActionType.URI,getRandomI18nData(),true,'buttonStyle', 'contentStyle');
    actions['hidden2']= new Action(ActionType.URI,getRandomI18nData(),true);
    const oneCard = new Card(getRandomAlphanumericValue(3, 24),
        card.id?card.id:getRandomAlphanumericValue(3, 24),
        card.publisher?card.publisher:'testPublisher',
        card.publisherVersion?card.publisherVersion:getRandomAlphanumericValue(3, 24),
        card.publishDate?card.publishDate:today,
        card.startDate? card.startDate:startTime,
        card.endDate?card.endDate:startTime + generateRandomPositiveIntegerWithinRangeWithOneAsMinimum(3455),
        card.severity?card.severity:Severity.QUESTION,
        getRandomAlphanumericValue(3, 24),
        getRandomAlphanumericValue(3, 24),
        generateRandomPositiveIntegerWithinRangeWithOneAsMinimum(4654, 5666),
        getRandomI18nData(),
        getRandomI18nData(),
        card.data?card.data:{data: "data"},
        card.details?card.details:
        [new CardDetail(null, getRandomI18nData(),null,"template1",null),
            new CardDetail(null, getRandomI18nData(),null,"template2",null),],
        actions
    );
    return oneCard;
}

export function getOneRandomCardWithRandomDetails(min=2,max=5,card?:any):Card{
    const randomDetails = generateRandomArray(min,max,getOneRandomCardDetail);
    card = card?card:{};
    card.details=card.details?card.details:randomDetails;
    return getOneRandomCard(card);
}

export function getOneRandomCardDetail(cardDetail?:any):CardDetail{
    cardDetail = cardDetail?cardDetail:{};
    const titlePosition = cardDetail.titlePosition ? cardDetail.titlePosition : pickARandomItemOfAnEnum(TitlePosition);
    const titleKey = cardDetail.title?cardDetail.title:getRandomI18nData();
    const titleStyle = cardDetail.titleStyle?cardDetail.titleStyle:getRandomAlphanumericValue(5,12);
    // const templateName = cardDetail.templateName?cardDetail.templateName:getRandomAlphanumericValue(4,12);
    const templateName = 'template1';
    const genString = () => getRandomAlphanumericValue(5,13);

    const styles=generateRandomArray(1,5,genString);
    return new CardDetail(titlePosition, titleKey,titleStyle,templateName,styles);
}

export function generateRandomArray<T>(min =1, max = 2, func:()=>T):Array<T>{
    let size = generateRandomPositiveIntegerWithinRangeWithOneAsMinimum(min,max);
    const array = [];
    for(let i = 0; i<size;++i){
        array[i]=func();
    }

    return array;
}

export function getSeveralRandomLightCards(numberOfCards = 1, cardTemplate?:any): LightCard[] {
    const finalNumberOfCards = forcePositiveAndOneMinimum(numberOfCards);
    const lightCards: LightCard[] = new Array(finalNumberOfCards);
    for (let i = 0; i < finalNumberOfCards; ++i) {
        lightCards[i] = getOneRandomLigthCard(cardTemplate);
    }
    return lightCards;
}


export function getRandomI18nData(): I18n {
    const paramNumber = generateRandomPositiveIntegerWithinRangeWithOneAsMinimum(4);
    const parameters: Map<string> = new Map();
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
