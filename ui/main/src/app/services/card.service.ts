/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Card, CardData, CardForPublishing, fromCardToLightCard} from '@ofModel/card.model';
import {HttpClient, HttpParams, HttpResponse} from '@angular/common/http';
import {environment} from '@env/environment';
import {LightCard} from '@ofModel/light-card.model';
import {Page} from '@ofModel/page.model';
import {map} from 'rxjs/operators';
import {LightCardsStoreService} from '../business/services/lightcards/lightcards-store.service';
import {I18n} from '@ofModel/i18n.model';
import {ArchivedCardsFilter} from '@ofModel/archived-cards-filter.model';

@Injectable({
    providedIn: 'root'
})
export class CardService {
    readonly cardsUrl: string;
    readonly archivesUrl: string;
    readonly cardsPubUrl: string;
    readonly userCardReadUrl: string;
    readonly userCardUrl: string;

    constructor(
        private httpClient: HttpClient,
        private lightCardsStoreService: LightCardsStoreService,
    ) {
        this.cardsUrl = `${environment.urls.cards}/cards`;
        this.archivesUrl = `${environment.urls.cards}/archives`;
        this.cardsPubUrl = `${environment.urls.cardspub}/cards`;
        this.userCardReadUrl = `${environment.urls.cardspub}/cards/userCardRead`;
        this.userCardUrl = `${environment.urls.cardspub}/cards/userCard`;
    }

    loadCard(id: string): Observable<CardData> {
        return this.httpClient.get<CardData>(`${this.cardsUrl}/${id}`).pipe(
            map((cardData) => {
                cardData.card.hasBeenAcknowledged =
                    this.lightCardsStoreService.isLightCardHasBeenAcknowledgedByUserOrByUserEntity(
                        fromCardToLightCard(cardData.card)
                    );
                return cardData;
            })
        );
    }

    loadArchivedCard(id: string): Observable<CardData> {
        return this.httpClient.get<CardData>(`${this.archivesUrl}/${id}`);
    }

    fetchFilteredArchivedCards(filter: ArchivedCardsFilter) {
        return this.httpClient.post<Page<LightCard>>(`${this.archivesUrl}`, filter);
    }

    convertFiltersIntoHttpParams(filters: Map<string, string[]>): HttpParams {
        let params = new HttpParams();
        filters.forEach((values, key) => values.forEach((value) => (params = params.append(key, value))));
        return params;
    }

    postCard(card: CardForPublishing): any {
        return this.httpClient.post<CardForPublishing>(`${this.cardsPubUrl}/userCard`, card, {observe: 'response'});
    }

    deleteCard(card: Card): Observable<HttpResponse<void>> {
        return this.httpClient.delete<void>(`${this.userCardUrl}/${card.id}`, {observe: 'response'});
    }

    postUserCardRead(cardUid: string): Observable<HttpResponse<void>> {
        return this.httpClient.post<void>(`${this.userCardReadUrl}/${cardUid}`, null, {observe: 'response'});
    }

    deleteUserCardRead(cardUid: string): Observable<HttpResponse<void>> {
        return this.httpClient.delete<void>(`${this.userCardReadUrl}/${cardUid}`, {observe: 'response'});
    }

    postTranslateCardField(processId: string, processVersion: string, i18nValue: I18n): any {
        const fieldToTranslate = {process: processId, processVersion: processVersion, i18nValue: i18nValue};
        return this.httpClient.post<any>(`${this.cardsPubUrl}/translateCardField`, fieldToTranslate, {
            observe: 'response'
        });
    }
}
