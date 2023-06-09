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
import {Card, CardCreationReportData, CardData, CardForPublishing, fromCardToLightCard} from '@ofModel/card.model';
import {map} from 'rxjs/operators';
import {I18n} from '@ofModel/i18n.model';
import {CardsFilter} from '@ofModel/cards-filter.model';
import {CardServer} from '../server/card.server';
import {ServerResponse, ServerResponseStatus} from '../server/serverResponse';
import {LightCardsStoreService} from './lightcards/lightcards-store.service';

@Injectable({
    providedIn: 'root'
})
export class CardService {

    constructor(
        private cardServer: CardServer,
        private lightCardsStoreService: LightCardsStoreService,
    ) {

    }

    loadCard(id: string): Observable<CardData> {
        return this.cardServer.loadCard(id).pipe(
            map((cardResponse) => {

                if (cardResponse.status === ServerResponseStatus.OK) {
                        const cardData = cardResponse.data;
                        cardData.card.hasBeenAcknowledged =
                            this.lightCardsStoreService.isLightCardHasBeenAcknowledgedByUserOrByUserEntity(
                                fromCardToLightCard(cardData.card));
                    return cardData;
                }
            })
        );
    }

    loadArchivedCard(id: string): Observable<CardData> {
        return this.cardServer.loadArchivedCard(id).pipe(map((serverResponse) => serverResponse.data));
    }

    fetchFilteredArchivedCards(filter: CardsFilter) {
        return this.cardServer.fetchFilteredArchivedCards(filter).pipe(map((serverResponse) => serverResponse.data));
    }

    postCard(card: CardForPublishing): Observable<ServerResponse<CardCreationReportData>> {
        return this.cardServer.postCard(card);
    }

    deleteCard(card: Card): Observable<ServerResponse<void>> {
        return this.cardServer.deleteCard(card);
    }

    postUserCardRead(cardUid: string): Observable<ServerResponse<void>> {
        return this.cardServer.postUserCardRead(cardUid);
    }

    deleteUserCardRead(cardUid: string): Observable<ServerResponse<void>> {
        return this.cardServer.deleteUserCardRead(cardUid);
    }

    postTranslateCardField(processId: string, processVersion: string, i18nValue: I18n): any {
        const fieldToTranslate = {process: processId, processVersion: processVersion, i18nValue: i18nValue};
        return this.cardServer.postTranslateCardField(fieldToTranslate).pipe(map((serverResponse) => serverResponse.data));
    }
}
