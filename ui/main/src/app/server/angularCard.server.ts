/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {ServerResponse} from "app/business/server/serverResponse";

import {Observable} from "rxjs";
import {AngularServer} from "./angular.server";
import {HttpClient} from '@angular/common/http';
import {environment} from "@env/environment";
import {Injectable} from "@angular/core";
import {CardServer} from "app/business/server/card.server";
import {CardsFilter} from "@ofModel/cards-filter.model";
import {CardForPublishing, Card, CardData, CardCreationReportData} from "@ofModel/card.model";
import {FieldToTranslate} from "@ofModel/field-to-translate.model";
import {LightCard} from "@ofModel/light-card.model";
import {Page} from "@ofModel/page.model";
import {LightCardsStoreService} from "app/business/services/lightcards/lightcards-store.service";

@Injectable({
    providedIn: 'root'
})
export class AngularCardServer extends AngularServer implements CardServer {
    cardsUrl: string;
    archivesUrl: string;
    cardsPubUrl: string;
    userCardReadUrl: string;
    userCardUrl: string;

    constructor(private httpClient: HttpClient, private lightCardsStoreService: LightCardsStoreService) {
        super();
        this.cardsUrl = `${environment.urls.cards}/cards`;
        this.archivesUrl = `${environment.urls.cards}/archives`;
        this.cardsPubUrl = `${environment.urls.cardspub}/cards`;
        this.userCardReadUrl = `${environment.urls.cardspub}/cards/userCardRead`;
        this.userCardUrl = `${environment.urls.cardspub}/cards/userCard`;
    }

    loadCard(id: string): Observable<ServerResponse<any>> {
        return this.processHttpResponse(this.httpClient.get<CardData>(`${this.cardsUrl}/${id}`));
    }

    loadArchivedCard(id: string): Observable<ServerResponse<any>> {
        return this.processHttpResponse(this.httpClient.get<CardData>(`${this.archivesUrl}/${id}`));
    }

    fetchFilteredArchivedCards(filter: CardsFilter): Observable<ServerResponse<any>> {
        return this.processHttpResponse(this.httpClient.post<Page<LightCard>>(`${this.archivesUrl}`, filter));
    }

    postCard(card: CardForPublishing): Observable<ServerResponse<CardCreationReportData>> {
        return this.processHttpResponse(this.httpClient.post<CardCreationReportData>(`${this.cardsPubUrl}/userCard`, card));
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
        return this.processHttpResponse(this.httpClient.post<FieldToTranslate>(`${this.cardsPubUrl}/translateCardField`, fieldToTranslate, {
            observe: 'response'
        }));
    }

}
