/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


import {LightCard, Severity} from '@ofModel/light-card.model';
import {CardOperation, CardOperationType} from '@ofModel/card-operation.model';
import {Card, Detail, TitlePosition} from "@ofModel/card.model";
import {I18n} from "@ofModel/i18n.model";
import {Map as OfMap} from "@ofModel/map";
import {Action, ActionType, Process, State, Third, ThirdMenu, ThirdMenuEntry} from "@ofModel/thirds.model";
import { Page } from '@ofModel/page.model';
import {AppState} from "@ofStore/index";
import {Map} from "@ofModel/map";

export const emptyAppState4Test:AppState = {
    router: null,
    feed: null,
    timeline: null,
    authentication: null,
    card: null,
    menu: null,
    config: null,
    settings: null,
    archive:null,
    time:null,
    user:null
};

export function getOneRandomMenu(): ThirdMenu {
    let entries: ThirdMenuEntry[]=[];
    let entryCount = getPositiveRandomNumberWithinRange(2,5);
    for(let j=0;j<entryCount;j++){
        entries.push(new ThirdMenuEntry(
            getRandomAlphanumericValue(3,10),
            getRandomAlphanumericValue(3,10),
            getRandomAlphanumericValue(3,10)
            )
        )
    }
    return new ThirdMenu(
        getRandomAlphanumericValue(3,10),
        getRandomAlphanumericValue(3,10),
        getRandomAlphanumericValue(3,10),
        entries);
}

export function getRandomMenus(): ThirdMenu[] {
    let result: ThirdMenu[] = [];
    let menuCount = getPositiveRandomNumberWithinRange(2,4);
    for (let i=0;i<menuCount;i++){
        result.push(getOneRandomMenu())
    }
    return result;
}

export function getRandomThird(): Third[] {
    let result: Third[] = [];
    let thirdCount = getPositiveRandomNumberWithinRange(1,3);
    for (let i=0;i<thirdCount;i++){
        result.push(getOneRandomThird());
    }
    return result;
}

export function getOneRandomThird(thirdTemplate?:any): Third {
    thirdTemplate=thirdTemplate?thirdTemplate:{};
    let entries:ThirdMenuEntry[]=[];
    let entryCount = getPositiveRandomNumberWithinRange(1,3);
    for(let i=0;i<entryCount;i++){
        entries.push(new ThirdMenuEntry(
            getRandomAlphanumericValue(3,10),
            getRandomAlphanumericValue(3,10),
            getRandomAlphanumericValue(3,10)
        ))
    }
    let processes= new OfMap();
    let processCount = getPositiveRandomNumberWithinRange(1,3);
    for(let i = 0; i< processCount;i++){
        let states = new OfMap();
        let stateCount = getPositiveRandomNumberWithinRange(1,3);
        for(let j=0; j<stateCount;j++){
            states[getRandomAlphanumericValue(3,10)]=
                new State(
                    getRandomCardDetails(),
                    getRandomActions());
        }
        processes[getRandomAlphanumericValue(3,10)]=new Process(states);
    }

   return new Third(
        thirdTemplate.name?thirdTemplate.name:getRandomAlphanumericValue(3,10),
        thirdTemplate.version?thirdTemplate.version:getRandomAlphanumericValue(3,10),
        thirdTemplate.i18nLabelKey?thirdTemplate.i18nLabelKey:getRandomAlphanumericValue(3,10),
        thirdTemplate.templates?thirdTemplate.templates:undefined,
       thirdTemplate.csses?thirdTemplate.csses:undefined,
       thirdTemplate.locales?thirdTemplate.locales:undefined,
       thirdTemplate.menuEntries?thirdTemplate.menuEntries:entries,
       thirdTemplate.processes?thirdTemplate.processes:processes);

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

export function getOneRandomLigthCard(lightCardTemplate?:any): LightCard {
    lightCardTemplate = lightCardTemplate?lightCardTemplate:{};
    const today = new Date().getTime();
    const startTime = today + generateRandomPositiveIntegerWithinRangeWithOneAsMinimum(1234);
    const oneCard = new LightCard(getRandomAlphanumericValue(3, 24),
        lightCardTemplate.id?lightCardTemplate.id:getRandomAlphanumericValue(3, 24),
        lightCardTemplate.publisher?lightCardTemplate.publisher:'testPublisher',
        lightCardTemplate.publisherVersion? lightCardTemplate.publisherVersion:getRandomAlphanumericValue(3, 24),
        lightCardTemplate.publishDate?lightCardTemplate.publishDate:today,
        lightCardTemplate.startDate? lightCardTemplate.startDate:startTime,
        lightCardTemplate.endDate?lightCardTemplate.endDate:startTime + generateRandomPositiveIntegerWithinRangeWithOneAsMinimum(3455),
        lightCardTemplate.severity?lightCardTemplate.severity:Severity.COMPLIANT,
        getRandomAlphanumericValue(3, 24),
        getRandomAlphanumericValue(3, 24),
        lightCardTemplate.lttd?lightCardTemplate.lttd:generateRandomPositiveIntegerWithinRangeWithOneAsMinimum(4654, 5666),
        getRandomI18nData(),
        getRandomI18nData(),
        lightCardTemplate.tags?lightCardTemplate.tags:null,
        lightCardTemplate.timeSpans?lightCardTemplate.timeSpans:null
    );
    return oneCard;
}
export function getRandomPage(totalPages = 1, totalElements = 10): Page<LightCard> {
    const lightCards = getSeveralRandomLightCards(totalElements);
    const randomPage = new Page<LightCard>(totalPages, totalElements, lightCards);
    return randomPage;
}

export function getRandomActions() {
    let actions:OfMap<Action> = new OfMap();
    actions['visible1']=new Action(ActionType.URL, getRandomI18nData());
    actions['visible2']=new Action(ActionType.URL, getRandomI18nData());
    actions['hidden1']= new Action(ActionType.URL, getRandomI18nData(), true, 'buttonStyle', 'contentStyle');
    actions['hidden2']= new Action(ActionType.URL, getRandomI18nData(), true);
    return actions;
}

export function getOneRandomCard(cardTemplate?:any): Card {
    cardTemplate = cardTemplate?cardTemplate:{};
    const today = new Date().getTime();
    const startTime = today + generateRandomPositiveIntegerWithinRangeWithOneAsMinimum(1234);
    const oneCard = new Card(getRandomAlphanumericValue(3, 24),
        cardTemplate.id?cardTemplate.id:getRandomAlphanumericValue(3, 24),
        cardTemplate.publisher?cardTemplate.publisher:'testPublisher',
        cardTemplate.publisherVersion?cardTemplate.publisherVersion:getRandomAlphanumericValue(3, 24),
        cardTemplate.publishDate?cardTemplate.publishDate:today,
        cardTemplate.startDate? cardTemplate.startDate:startTime,
        cardTemplate.endDate?cardTemplate.endDate:startTime + generateRandomPositiveIntegerWithinRangeWithOneAsMinimum(3455),
        cardTemplate.severity?cardTemplate.severity:Severity.COMPLIANT,
        getRandomAlphanumericValue(3, 24),
        cardTemplate.process?cardTemplate.process:getRandomAlphanumericValue(3, 24),
        cardTemplate.processId?cardTemplate.processId:getRandomAlphanumericValue(3, 24),
        cardTemplate.state?cardTemplate.state:getRandomAlphanumericValue(3, 24),
        generateRandomPositiveIntegerWithinRangeWithOneAsMinimum(4654, 5666),
        getRandomI18nData(),
        getRandomI18nData(),
        cardTemplate.data?cardTemplate.data:{data: "data"},
        cardTemplate.details?cardTemplate.details:
        [new Detail(null, getRandomI18nData(),null,"template1",null),
            new Detail(null, getRandomI18nData(),null,"template2",null),]
    );
    return oneCard;
}

export function getOneRandomCardWithRandomDetails(min=2,max=5,card?:any):Card{
    const randomDetails = generateRandomArray(min,max,getOneRandomCardDetail);
    card = card?card:{};
    card.details=card.details?card.details:randomDetails;
    return getOneRandomCard(card);
}

export function getRandomCardDetails(...cardDetailTemplates:any[]){
    let detailCount;
    if(cardDetailTemplates){
        detailCount = cardDetailTemplates.length;
    }else{
        detailCount = getPositiveRandomNumberWithinRange(1,3);
    }
    let result = [];
    for(let i = 0; i<detailCount;i++) {
        result.push(getOneRandomCardDetail(cardDetailTemplates ? cardDetailTemplates[i] : null));
    }
    return result;
}

export function getOneRandomCardDetail(cardDetailTemplate?:any):Detail{
    cardDetailTemplate = cardDetailTemplate?cardDetailTemplate:{};
    const titlePosition = cardDetailTemplate.titlePosition ? cardDetailTemplate.titlePosition : pickARandomItemOfAnEnum(TitlePosition);
    const titleKey = cardDetailTemplate.title?cardDetailTemplate.title:getRandomI18nData();
    const titleStyle = cardDetailTemplate.titleStyle?cardDetailTemplate.titleStyle:getRandomAlphanumericValue(5,12);
    // const templateName = cardDetail.templateName?cardDetail.templateName:getRandomAlphanumericValue(4,12);
    const templateName = 'template1';
    const genString = () => getRandomAlphanumericValue(5,13);

    const styles=generateRandomArray(1,5,genString);
    return new Detail(titlePosition, titleKey,titleStyle,templateName,styles);
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
    const parameters: OfMap<string> = new OfMap();
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

export function shuffleArrayContentByFisherYatesLike<T>(array: Array<T>): Array<T> {
    let workingArray = Object.assign([], array);
    let currentLengthOfRemainingArrayToShuffle = array.length;
    let valueHolderForPermutation: T;
    let currentIndex: number;
    // need a new array other wise the old one behave weirdly
    const result = Array<T>(currentLengthOfRemainingArrayToShuffle);
    while (currentLengthOfRemainingArrayToShuffle) {
        currentIndex = Math.floor(Math.random() * currentLengthOfRemainingArrayToShuffle--);
        valueHolderForPermutation = workingArray[currentLengthOfRemainingArrayToShuffle];
        result[currentLengthOfRemainingArrayToShuffle] = workingArray[currentIndex];
        workingArray[currentIndex] = valueHolderForPermutation;
    }
    return result;
}

export function generateThirdWithVersion(thirdName?: string, versions?: Set<string>): Map<Set<string>> {
    const result = new Map<Set<string>>();
    const third = (thirdName) ? thirdName : getRandomAlphanumericValue(3, 5);
    function getSomeVersions(){return getRandomAlphanumericValue(3,8)};
    const versionValues = (versions) ? versions : new Set( generateRandomArray(3, 6, getSomeVersions));
    result[third] = versionValues;
    return result;
}
