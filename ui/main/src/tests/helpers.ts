/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
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
import {Observable, ReplaySubject, firstValueFrom, of} from 'rxjs';
import {Type} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {Guid} from 'guid-typescript';
import SpyObj = jasmine.SpyObj;
import {UserWithPerimeters} from '@ofModel/userWithPerimeters.model';
import {UserServerMock} from './mocks/userServer.mock';
import {ServerResponse, ServerResponseStatus} from 'app/business/server/serverResponse';
import {UserService} from 'app/business/services/users/user.service';
import {ProcessServerMock} from './mocks/processServer.mock';
import {Process} from '@ofModel/processes.model';
import {ProcessesService} from 'app/business/services/businessconfig/processes.service';
import {ModalService} from 'app/business/services/modal.service';
import {ModalServerMock} from './mocks/modalServer.mock';
import {ConfigServerMock} from './mocks/configServer.mock';
import {ConfigService} from 'app/business/services/config.service';
import {EntitiesService} from 'app/business/services/users/entities.service';
import {EntitiesServerMock} from './mocks/entitiesServer.mock';
import {Entity} from '@ofModel/entity.model';
import {OpfabAPI} from 'app/api/opfab.api';
import {Message} from '@ofModel/message.model';
import {AlertMessageService} from 'app/business/services/alert-message.service';
import {CurrentCardAPI} from 'app/api/currentcard.api';
import {CurrentUserCardAPI} from 'app/api/currentusercard.api';
import {TranslationServiceMock} from './mocks/translation.service.mock';

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
        lightCardTemplate.state ?? 'testState',
        lightCardTemplate.parentCardId ?? null,
        lightCardTemplate.initialParentCardUid ?? null,
        lightCardTemplate.representative ?? null,
        lightCardTemplate.representativeType ?? null,
        lightCardTemplate.wktGeometry ?? null,
        lightCardTemplate.wktProjection ?? null,
        lightCardTemplate.entitiesAcks ?? null,
        lightCardTemplate.entityRecipients ?? null,
        lightCardTemplate.entityRecipientsForInformation ?? null,
        lightCardTemplate.entitiesAllowedToRespond ?? null,
        lightCardTemplate.entitiesRequiredToRespond ?? null,
        lightCardTemplate.entitiesAllowedToEdit ?? null,
        lightCardTemplate.publisherType ?? null,
        lightCardTemplate.secondsBeforeTimeSpanForReminder ?? null,
        lightCardTemplate.actions ?? null
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
        cardTemplate.title ?? getI18nData('testTitle'),
        cardTemplate.summary ?? getI18nData('testSummary'),
        cardTemplate.titleTranslated ?? 'testTitleTranslated',
        cardTemplate.summaryTranslated ?? 'testSummaryTranslated',
        cardTemplate.data ?? {data: 'data'},
        cardTemplate.userRecipients ?? null,
        cardTemplate.groupRecipients ?? null,
        cardTemplate.entityRecipients ?? null,
        cardTemplate.entityRecipientsForInformation ?? null,
        undefined,
        cardTemplate.entitiesAllowedToRespond ?? null,
        cardTemplate.entitiesRequiredToRespond ?? null,
        cardTemplate.entitiesAllowedToEdit ?? null,
        cardTemplate.parentCardId ?? null,
        cardTemplate.initialParentCardUid ?? null,
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
        cardTemplate.rRule ?? null,
        cardTemplate.actions ?? null
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
    const parameters = new Object();
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

export async function setUserPerimeter(userWithPerimeters: UserWithPerimeters) {
    const userServerMock = new UserServerMock();
    UserService.setUserServer(userServerMock);
    userServerMock.setResponseForCurrentUserWithPerimeter(
        new ServerResponse(userWithPerimeters, ServerResponseStatus.OK, null)
    );
    await firstValueFrom(UserService.loadUserWithPerimetersData());
}

export async function setProcessConfiguration(
    processes: Process[],
    processesWithAllVersions: Process[] = undefined,
    processGroups: any = {groups: []}
) {
    const processServerMock = new ProcessServerMock();
    processServerMock.setResponseForProcessesDefinition(new ServerResponse(processes, ServerResponseStatus.OK, null));
    processServerMock.setResponseForProcessesWithAllVersions(
        new ServerResponse(processesWithAllVersions ?? processes, ServerResponseStatus.OK, null)
    );
    processServerMock.setResponseForProcessGroups(new ServerResponse(processGroups, ServerResponseStatus.OK, null));
    ProcessesService.setProcessServer(processServerMock);
    await firstValueFrom(ProcessesService.loadAllProcessesWithLatestVersion());
    await firstValueFrom(ProcessesService.loadAllProcessesWithAllVersions());
    await firstValueFrom(ProcessesService.loadProcessGroups());
}

export async function waitForAllPromises() {
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
}

export function getModalServerMock(): ModalServerMock {
    const modalServerMock = new ModalServerMock();
    ModalService.setModalServer(modalServerMock);
    return modalServerMock;
}

export async function loadWebUIConf(conf: any) {
    const configServerMock = new ConfigServerMock();
    ConfigService.setConfigServer(configServerMock);
    configServerMock.setResponseForWebUIConfiguration(new ServerResponse(conf, ServerResponseStatus.OK, null));
    await firstValueFrom(ConfigService.loadWebUIConfiguration());
}

export async function setEntities(entities: Entity[]) {
    const entitiesServerMock = new EntitiesServerMock();
    EntitiesService.setEntitiesServer(entitiesServerMock);
    entitiesServerMock.setEntities(entities);
    await firstValueFrom(EntitiesService.loadAllEntitiesData());
}

export function initOpfabAPI() {
    OpfabAPI.init();
    OpfabAPI.initAPI(new TranslationServiceMock());
    CurrentUserCardAPI.initUserCardTemplateInterface();
    CurrentCardAPI.initTemplateInterface();
}

export class AlertMessageReceiver {
    private alertSubject: ReplaySubject<Message>;
    constructor() {
        this.alertSubject = new ReplaySubject<Message>();
        this.listenForMessageReceived();
    }

    async listenForMessageReceived() {
        const message = await firstValueFrom(AlertMessageService.getAlertMessage());
        this.alertSubject.next(message);
    }

    async getMessageReceived(): Promise<Message> {
        return await firstValueFrom(this.alertSubject.asObservable());
    }
}
