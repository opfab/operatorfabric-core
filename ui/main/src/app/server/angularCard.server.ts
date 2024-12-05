/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {ServerResponse} from 'app/business/server/serverResponse';

import {Observable} from 'rxjs';
import {AngularServer} from './angular.server';
import {HttpClient} from '@angular/common/http';
import {environment} from '@env/environment';
import {Injectable} from '@angular/core';
import {CardServer} from 'app/business/server/card.server';
import {CardsFilter} from '@ofModel/cards-filter.model';
import {CardForPublishing, Card, CardWithChildCards, CardCreationReportData} from '@ofModel/card.model';
import {FieldToTranslate} from '@ofModel/field-to-translate.model';
import {LightCard} from '@ofModel/light-card.model';
import {Page} from '@ofModel/page.model';

@Injectable({
    providedIn: 'root'
})
export class AngularCardServer extends AngularServer implements CardServer {
    private readonly cardConsultationUrl: string;
    private readonly archivesUrl: string;
    private readonly cardPublicationUrl: string;
    private readonly userCardReadUrl: string;
    private readonly userCardUrl: string;

    constructor(private readonly httpClient: HttpClient) {
        super();
        this.cardConsultationUrl = `${environment.url}cards-consultation/cards`;
        this.archivesUrl = `${environment.url}cards-consultation/archives`;
        this.cardPublicationUrl = `${environment.url}cards-publication/cards`;
        this.userCardReadUrl = `${environment.url}cards-publication/cards/userCardRead`;
        this.userCardUrl = `${environment.url}cards-publication/cards/userCard`;
    }

    loadCard(id: string): Observable<ServerResponse<any>> {
        return this.processHttpResponse(this.httpClient.get<CardWithChildCards>(`${this.cardConsultationUrl}/${id}`));
    }

    loadArchivedCard(id: string): Observable<ServerResponse<any>> {
        return this.processHttpResponse(this.httpClient.get<CardWithChildCards>(`${this.archivesUrl}/${id}`));
    }

    fetchFilteredArchivedCards(filter: CardsFilter): Observable<ServerResponse<any>> {
        return this.processHttpResponse(this.httpClient.post<Page<LightCard>>(`${this.archivesUrl}`, filter));
    }

    fetchFilteredCards(filter: CardsFilter): Observable<ServerResponse<any>> {
        return this.processHttpResponse(this.httpClient.post<Page<any>>(`${this.cardConsultationUrl}`, filter));
    }

    postCard(card: CardForPublishing): Observable<ServerResponse<CardCreationReportData>> {
        return this.processHttpResponse(
            this.httpClient.post<CardCreationReportData>(`${this.cardPublicationUrl}/userCard`, card)
        );
    }

    deleteCard(card: Card): Observable<ServerResponse<any>> {
        return this.processHttpResponse(this.httpClient.delete<void>(`${this.userCardUrl}/${card.id}`));
    }

    postUserCardRead(cardUid: string): Observable<ServerResponse<any>> {
        return this.processHttpResponse(this.httpClient.post<void>(`${this.userCardReadUrl}/${cardUid}`, null));
    }

    deleteUserCardRead(cardUid: string): Observable<ServerResponse<any>> {
        return this.processHttpResponse(this.httpClient.delete<void>(`${this.userCardReadUrl}/${cardUid}`));
    }

    postTranslateCardField(fieldToTranslate: FieldToTranslate): Observable<ServerResponse<any>> {
        return this.processHttpResponse(
            this.httpClient.post<FieldToTranslate>(`${this.cardPublicationUrl}/translateCardField`, fieldToTranslate)
        );
    }

    fetchConnectedRecipients(lightcard: LightCard): Observable<ServerResponse<string[]>> {
        return this.processHttpResponse(
            this.httpClient.post<string[]>(`${this.cardConsultationUrl}/connectedRecipientsPreview`, lightcard)
        );
    }
}
