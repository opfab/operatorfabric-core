/* Copyright (c) 2023-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {CardForPublishing} from '@ofServices/cards/model/CardForPublishing';
import {CardCreationReportData} from '@ofServices/cards/model/CardCreationReportData';
import {CardsFilter} from '@ofServices/cards/model/CardsFilter';
import {FieldToTranslate} from '@ofServices/cards/model/FieldToTranslate';
import {Card} from 'app/model/Card';
import {CardsServer} from '@ofServices/cards/server/CardsServer';
import {ServerResponse, ServerResponseStatus} from 'app/server/ServerResponse';
import {Observable, of} from 'rxjs';

export class CardsServerMock implements CardsServer {
    private setResponseForLoadCard: Function;
    private setResponseForLoadArchivedCard: Function;
    private setResponseForPostCard: () => ServerResponse<CardCreationReportData> = () =>
        new ServerResponse<CardCreationReportData>(
            new CardCreationReportData('cardCreatedUid', 'cardCreatedId'),
            ServerResponseStatus.OK,
            null
        );

    public cardsPosted: CardForPublishing[] = [];

    public setResponseFunctionForLoadCard(respFunc: Function) {
        this.setResponseForLoadCard = respFunc;
    }

    public setResponseFunctionForLoadArchivedCard(respFunc: Function) {
        this.setResponseForLoadArchivedCard = respFunc;
    }

    public setResponseFunctionForPostCard(respFunc: () => ServerResponse<CardCreationReportData>) {
        this.setResponseForPostCard = respFunc;
    }

    loadCard(id: string): Observable<ServerResponse<any>> {
        return of(this.setResponseForLoadCard(id));
    }
    loadArchivedCard(id: string): Observable<ServerResponse<any>> {
        return of(this.setResponseForLoadArchivedCard(id));
    }
    fetchFilteredArchivedCards(filter: CardsFilter): Observable<ServerResponse<any>> {
        throw new Error('Method not implemented.');
    }
    postCard(card: CardForPublishing): Observable<ServerResponse<CardCreationReportData>> {
        this.cardsPosted.push(card);
        return of(this.setResponseForPostCard());
    }
    deleteCard(card: Card): Observable<ServerResponse<any>> {
        throw new Error('Method not implemented.');
    }
    postUserCardRead(cardUid: string): Observable<ServerResponse<any>> {
        throw new Error('Method not implemented.');
    }
    deleteUserCardRead(cardUid: string): Observable<ServerResponse<any>> {
        throw new Error('Method not implemented.');
    }
    postTranslateCardField(fieldToTranslate: FieldToTranslate): Observable<ServerResponse<any>> {
        return of(
            new ServerResponse(
                {
                    translatedField: `Translation of ${fieldToTranslate.i18nValue?.key} for process ${fieldToTranslate.process} with version ${fieldToTranslate.processVersion}`
                },
                ServerResponseStatus.OK,
                null
            )
        );
    }
    fetchFilteredCards(filter: CardsFilter): Observable<ServerResponse<any>> {
        throw new Error('Method not implemented.');
    }
    fetchConnectedRecipients(lightcard: Card): Observable<ServerResponse<string[]>> {
        throw new Error('Method not implemented.');
    }
}
