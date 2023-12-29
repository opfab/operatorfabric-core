/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {LightCard, Severity} from '@ofModel/light-card.model';
import {Card} from '@ofModel/card.model';
import {I18n} from '@ofModel/i18n.model';
import {TranslateLoader} from '@ngx-translate/core';
import {Observable, of} from 'rxjs';
import {Type} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {Guid} from 'guid-typescript';
import SpyObj = jasmine.SpyObj;

const NB_SECONDS_IN_ONE_MINUTE = 60;
const NB_MILLIS_IN_ONE_SECOND = 1000;

export function getOneLightCard(lightCardTemplate?: any): LightCard {
    lightCardTemplate = lightCardTemplate ?? {};
    const today = new Date().getTime();
    const startTime = today + 2 * NB_SECONDS_IN_ONE_MINUTE * NB_MILLIS_IN_ONE_SECOND;
    return new LightCard(
        Guid.create().toString(),
        lightCardTemplate.id ?? 'testId',
        lightCardTemplate.publisher ?? 'testPublisher',
        lightCardTemplate.publisherVersion ?? 'testPublisherVersion',
        lightCardTemplate.publishDate ?? today,
        lightCardTemplate.startDate ?? startTime,
        lightCardTemplate.endDate ?? startTime + 1 * NB_SECONDS_IN_ONE_MINUTE * NB_MILLIS_IN_ONE_SECOND,
        lightCardTemplate.expirationDate ?? startTime + 1 * NB_SECONDS_IN_ONE_MINUTE * NB_MILLIS_IN_ONE_SECOND,
        lightCardTemplate.severity ?? Severity.ALARM,
        lightCardTemplate.hasBeenAcknowledged ?? false,
        lightCardTemplate.hasBeenRead ?? false,
        lightCardTemplate.hasChildCardFromCurrentUserEntity ?? false,
        'testProcessInstanceId',
        lightCardTemplate.lttd ?? 5000,
        getI18nData('testTitle'),
        getI18nData('testSummary'),
        'testTitleTranslated',
        'testSummaryTranslated',
        lightCardTemplate.tags ?? null,
        lightCardTemplate.timeSpans ?? null,
        lightCardTemplate.rrule ?? null,
        lightCardTemplate.process ?? 'testProcess',
        lightCardTemplate.state ?? 'testState'
    );
}

export function getOneCard(cardTemplate?: any): Card {
    cardTemplate = cardTemplate ?? {};
    const today = new Date().getTime();
    const startTime = today + 2 * NB_SECONDS_IN_ONE_MINUTE * NB_MILLIS_IN_ONE_SECOND;
    return new Card(
        Guid.create().toString(),
        cardTemplate.id ?? 'testId',
        cardTemplate.publisher ?? 'testPublisher',
        cardTemplate.processVersion ?? 'testProcessVersion',
        cardTemplate.publishDate ?? today,
        cardTemplate.startDate ?? startTime,
        cardTemplate.endDate ?? startTime + 1 * NB_SECONDS_IN_ONE_MINUTE * NB_MILLIS_IN_ONE_SECOND,
        cardTemplate.expirationDate ?? startTime + 1 * NB_SECONDS_IN_ONE_MINUTE * NB_MILLIS_IN_ONE_SECOND,
        cardTemplate.severity ?? Severity.ALARM,
        cardTemplate.hasBeenAcknowledged ?? false,
        false,
        false,
        cardTemplate.process ?? 'testProcess',
        cardTemplate.processInstanceId ?? 'testProcessInstanceId',
        cardTemplate.state ?? 'testState',
        cardTemplate.lttd ?? null,
        getI18nData('testTitle'),
        getI18nData('testSummary'),
        cardTemplate.titleTranslated ?? 'testTitleTranslated',
        cardTemplate.summaryTranslated ?? 'testSummaryTranslated',
        cardTemplate.data ?? {data: 'data'},
        cardTemplate.userRecipients ?? null,
        cardTemplate.groupRecipients ?? null,
        cardTemplate.entityRecipients ?? null,
        undefined,
        undefined,
        cardTemplate.entitiesAllowedToRespond ?? null,
        cardTemplate.entitiesRequiredToRespond ?? null,
        cardTemplate.entitiesAllowedToEdit ?? null,
        cardTemplate.parentCardId ?? null,
        cardTemplate.initialParentCardUid ?? null,
        cardTemplate.keepChildCards ?? null,
        cardTemplate.publisherType ?? null,
        cardTemplate.representative ?? null,
        cardTemplate.representativeType ?? null,
        cardTemplate.tags ?? null,
        cardTemplate.wktGeometry ?? null,
        cardTemplate.wktProjection ?? null,
        cardTemplate.secondsBeforeTimeSpanForReminder ?? null,
        cardTemplate.timeSpans ?? null,
        cardTemplate.entitiesAcks ?? null,
        undefined,
        cardTemplate.rRule ?? null
    );
}

export function getSeveralLightCards(numberOfCards = 1, cardTemplate?: any): LightCard[] {
    const finalNumberOfCards = forcePositiveAndOneMinimum(numberOfCards);
    const lightCards: LightCard[] = new Array(finalNumberOfCards);
    for (let i = 0; i < finalNumberOfCards; ++i) {
        lightCards[i] = getOneLightCard(cardTemplate);
    }
    return lightCards;
}

export function getI18nData(key: string): I18n {
    const parameters: Map<string, string> = new Map();
    parameters['param1'] = 'value1';
    parameters['param2'] = 'value2';

    return new I18n(key, parameters);
}

function forcePositiveAndOneMinimum(min: number): number {
    return min < 0 ? 1 : min;
}

export class BusinessconfigI18nLoader implements TranslateLoader {
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
 * It generates errors such as "Type 'Store<any>' is not assignable to type 'SpyObj<Store<AppState>>'".
 * See https://github.com/angular/angular/issues/35944
 * */
export function injectedSpy<S>(service: Type<S>): SpyObj<S> {
    return TestBed.inject(service) as SpyObj<S>;
}
