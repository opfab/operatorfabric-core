/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {LightCard, Severity} from '@ofModel/light-card.model';
import {CardOperation, CardOperationType} from '@ofModel/card-operation.model';
import {Process, State} from '@ofModel/processes.model';
import {Menu, MenuEntry, MenuEntryLinkTypeEnum} from '@ofModel/menu.model';
import {Card} from '@ofModel/card.model';
import {I18n} from '@ofModel/i18n.model';
import {Map as OfMap, Map} from '@ofModel/map';
import {Page} from '@ofModel/page.model';
import {AppState} from '@ofStore/index';
import {AuthenticationService} from '@ofServices/authentication/authentication.service';
import {GuidService} from '@ofServices/guid.service';
import {OAuthLogger, OAuthService, UrlHelperService} from 'angular-oauth2-oidc';
import {TranslateLoader} from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import {Type} from '@angular/core';
import SpyObj = jasmine.SpyObj;
import {TestBed} from '@angular/core/testing';

export const emptyAppState4Test: AppState = {
    router: null,
    feed: null,
    authentication: null,
    card: null,
    menu: null,
    config: null,
    settings: null,
    user:null,
    cardsSubscription:null,
    globalStyle: null,
    logging: null,
    monitoring: null,
};

export const AuthenticationImportHelperForSpecs = [AuthenticationService,
    GuidService,
    OAuthService,
    UrlHelperService,
    OAuthLogger];


export function getOneRandomMenu(): Menu {
    let entries: MenuEntry[]=[];
    let entryCount = getPositiveRandomNumberWithinRange(2,5);
    for (let j = 0; j < entryCount; j++) {
        entries.push(new MenuEntry(
            getRandomAlphanumericValue(3, 10),
            getRandomAlphanumericValue(3, 10),
            getRandomAlphanumericValue(3, 10),
            MenuEntryLinkTypeEnum.BOTH
            )
        );
    }
    return new Menu(
        getRandomAlphanumericValue(3,10),
        getRandomAlphanumericValue(3,10),
        entries);
}

export function getRandomMenus(): Menu[] {
    let result: Menu[] = [];
    let menuCount = getPositiveRandomNumberWithinRange(2,4);
    for (let i=0;i<menuCount;i++){
        result.push(getOneRandomMenu())
    }
    return result;
}

export function getOneRandomProcess(processTemplate?:any): Process {
    processTemplate=processTemplate?processTemplate:{};
    let entries:MenuEntry[]=[];
    let entryCount = getPositiveRandomNumberWithinRange(1,3);
    for(let i=0;i<entryCount;i++){
        entries.push(new MenuEntry(
            getRandomAlphanumericValue(3,10),
            getRandomAlphanumericValue(3,10),
            getRandomAlphanumericValue(3,10),
            MenuEntryLinkTypeEnum.BOTH
        ))
    }
    let states = new OfMap();
    let stateCount = getPositiveRandomNumberWithinRange(1,3);

    for(let j=0; j<stateCount;j++){
        const titleKey =  getRandomI18nData();
        const templateName = 'template1';
        states[getRandomAlphanumericValue(3,10)]=
            new State(templateName, ['style1','style2']);
    }


    return new Process(
        processTemplate.id?processTemplate.id:getRandomAlphanumericValue(3,10),
        processTemplate.version?processTemplate.version:getRandomAlphanumericValue(3,10),
        processTemplate.name?processTemplate.name:getRandomAlphanumericValue(3,10),
        processTemplate.locales?processTemplate.locales:undefined,
        processTemplate.states?processTemplate.states:states);

}

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

// heavily based on enum implementation
export function pickARandomItemOfAnEnum<E>(currentEnum: E): E {
    const keys = Object.keys(currentEnum).filter(k => {
        const parsedInt = parseInt(k);
        const isNum = !isNaN(parsedInt);
        return isNum;
    });
    const randomIndex = getRandomIndex(keys);
    const key = keys[randomIndex];
    return currentEnum[key];
}


export function getRandomIndex<E>(array: E[]){
    if(array && array.length >0){
        return generateRandomPositiveIntegerWithinRangeWithOneAsMinimum(0,array.length);
    }else{
        return 0;
    }
}

export function getOneRandomLightCard(lightCardTemplate?: any): LightCard {
    lightCardTemplate = lightCardTemplate ? lightCardTemplate : {};
    const today = new Date().getTime();
    const startTime = today + generateRandomPositiveIntegerWithinRangeWithOneAsMinimum(1234);
    const oneCard = new LightCard(getRandomAlphanumericValue(3, 24),
        lightCardTemplate.id ? lightCardTemplate.id : getRandomAlphanumericValue(3, 24),
        lightCardTemplate.publisher ? lightCardTemplate.publisher : 'testPublisher',
        lightCardTemplate.publisherVersion ? lightCardTemplate.publisherVersion : getRandomAlphanumericValue(3, 24),
        lightCardTemplate.publishDate ? lightCardTemplate.publishDate : today,
        lightCardTemplate.startDate ? lightCardTemplate.startDate : startTime,
        lightCardTemplate.endDate ? lightCardTemplate.endDate : startTime + generateRandomPositiveIntegerWithinRangeWithOneAsMinimum(3455),
        lightCardTemplate.severity ? lightCardTemplate.severity : getRandomSeverity(),
        false,
        lightCardTemplate.hasBeenRead ? lightCardTemplate.hasBeenRead : false,
        false,
        getRandomAlphanumericValue(3, 24),
        lightCardTemplate.lttd ? lightCardTemplate.lttd : generateRandomPositiveIntegerWithinRangeWithOneAsMinimum(4654, 5666),
        getRandomI18nData(),
        getRandomI18nData(),
        lightCardTemplate.tags?lightCardTemplate.tags:null,
        lightCardTemplate.timeSpans?lightCardTemplate.timeSpans:null,
        lightCardTemplate.process?lightCardTemplate.process:'testProcess'
    );
    return oneCard;
}

export function getRandomSeverity(): Severity {
    const severities: Severity[] = [Severity.ALARM, Severity.ACTION, Severity.COMPLIANT, Severity.INFORMATION];
    return severities[getPositiveRandomNumberWithinRange(0, 3)];
}

export function getRandomPage(totalPages = 1, totalElements = 10): Page<LightCard> {
    const lightCards = getSeveralRandomLightCards(totalElements);
    const randomPage = new Page<LightCard>(totalPages, totalElements, lightCards);
    return randomPage;
}


export function getOneRandomCard(cardTemplate?:any): Card {
    cardTemplate = cardTemplate ? cardTemplate : {};
    const today = new Date().getTime();
    const startTime = today + generateRandomPositiveIntegerWithinRangeWithOneAsMinimum(1234);
    const oneCard = new Card(getRandomAlphanumericValue(3, 24),
        cardTemplate.id ? cardTemplate.id : getRandomAlphanumericValue(3, 24),
        cardTemplate.publisher ? cardTemplate.publisher : getRandomAlphanumericValue(3, 24),
        cardTemplate.processVersion ? cardTemplate.processVersion : getRandomAlphanumericValue(3, 24),
        cardTemplate.publishDate ? cardTemplate.publishDate : today,
        cardTemplate.startDate ? cardTemplate.startDate : startTime,
        cardTemplate.endDate ? cardTemplate.endDate : startTime + generateRandomPositiveIntegerWithinRangeWithOneAsMinimum(3455),
        cardTemplate.severity ? cardTemplate.severity : getRandomSeverity(),
        false,
        false,
        false,
        cardTemplate.process ? cardTemplate.process : 'testProcess',
        cardTemplate.processInstanceId ? cardTemplate.processInstanceId : getRandomAlphanumericValue(3, 24),
        cardTemplate.state ? cardTemplate.state : getRandomAlphanumericValue(3, 24),
        generateRandomPositiveIntegerWithinRangeWithOneAsMinimum(4654, 5666),
        getRandomI18nData(),
        getRandomI18nData(),
        cardTemplate.data ? cardTemplate.data : {data: "data"},
        undefined,
        undefined,
        undefined,
        undefined,
        cardTemplate.entitiesAllowedToRespond ? cardTemplate.entitiesAllowedToRespond : null,
        cardTemplate.entitiesRequiredToRespond ? cardTemplate.entitiesRequiredToRespond : null
    );
    return oneCard;
}

export function generateRandomArray<T>(min = 1, max = 2, func: () => T): Array<T> {
    const size = generateRandomPositiveIntegerWithinRangeWithOneAsMinimum(min, max);
    const array = [];
    for (let i = 0; i < size; ++i) {
        array[i] = func();
    }

    return array;
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

export function generateRandomPositiveIntegerWithinRangeWithOneAsMinimum(min = 1, max = 1): number{
    const minimum = forcePositiveAndOneMinimum(min);
    const maximum = handleMaxAgainstMin(minimum, max);
    return Math.floor(Math.random() * (maximum - minimum) + minimum);
}

export function getRandomBoolean(): boolean {
    return Math.random() >= 0.5;

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
    const workingArray = Object.assign([], array);
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

export function generateBusinessconfigWithVersion(businessconfigName?: string, versions?: Set<string>): Map<Set<string>> {
    const result = new Map<Set<string>>();
    const businessconfig = (businessconfigName) ? businessconfigName : getRandomAlphanumericValue(3, 5);
    function getSomeVersions(){return getRandomAlphanumericValue(3,8)};
    const versionValues = (versions) ? versions : new Set( generateRandomArray(3, 6, getSomeVersions));
    result[businessconfig] = versionValues;
    return result;
}

export class BusinessconfigI18nLoader implements TranslateLoader {

    constructor() {
    }

    getTranslation(lang: string): Observable<any> {
        return of({});
    }

}

export function BusinessconfigI18nLoaderFactory(): TranslateLoader {
    return new BusinessconfigI18nLoader();
}

/** This function helps get around the fact that TestBed.inject() which replaces TestBed.get in Angular v9 is type-safe, so it returns the
 * type of the actual object, which often clashes with the expected type (mock or spy) of the variable. We can't use the "real" type on the
 * variable because we usually need to access methods from the spy or mock.
 * It generate errors such as "Type 'Store<any>' is not assignable to type 'SpyObj<Store<AppState>>'".
 * See https://github.com/angular/angular/issues/35944
 * */
export function injectedSpy<S>(service: Type<S>): SpyObj<S> {
    return TestBed.inject(service) as SpyObj<S>;
}
