/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */
import {Observable} from 'rxjs';
import {
    Card,
    CardCreationReportData,
    CardWithChildCards,
    CardForPublishing,
    fromCardToLightCard
} from '@ofModel/card.model';
import {map} from 'rxjs/operators';
import {I18n} from '@ofModel/i18n.model';
import {CardsFilter} from '@ofModel/cards-filter.model';
import {CardServer} from '../../server/card.server';
import {ServerResponse, ServerResponseStatus} from '../../server/serverResponse';
import {AcknowledgeService} from '../../../services/acknowlegment/AcknowledgeService';
import {LightCard} from '@ofModel/light-card.model';

export class CardService {
    private static cardServer: CardServer;

    public static setCardServer(cardServer: CardServer) {
        CardService.cardServer = cardServer;
    }

    public static loadCard(id: string): Observable<CardWithChildCards> {
        return CardService.cardServer.loadCard(id).pipe(
            map((cardResponse) => {
                if (cardResponse.status === ServerResponseStatus.OK) {
                    const cardData = cardResponse.data;
                    cardData.card.hasBeenAcknowledged =
                        AcknowledgeService.isLightCardHasBeenAcknowledgedByUserOrByUserEntity(
                            fromCardToLightCard(cardData.card)
                        );
                    return cardData;
                }
            })
        );
    }

    public static loadArchivedCard(id: string): Observable<CardWithChildCards> {
        return CardService.cardServer.loadArchivedCard(id).pipe(map((serverResponse) => serverResponse.data));
    }

    public static fetchFilteredArchivedCards(filter: CardsFilter) {
        return CardService.cardServer
            .fetchFilteredArchivedCards(filter)
            .pipe(map((serverResponse) => serverResponse.data));
    }

    public static fetchFilteredCards(filter: CardsFilter) {
        return CardService.cardServer.fetchFilteredCards(filter).pipe(map((serverResponse) => serverResponse.data));
    }

    public static postCard(card: CardForPublishing): Observable<ServerResponse<CardCreationReportData>> {
        return CardService.cardServer.postCard(card);
    }

    public static deleteCard(card: Card): Observable<ServerResponse<void>> {
        return CardService.cardServer.deleteCard(card);
    }

    public static postUserCardRead(cardUid: string): Observable<ServerResponse<void>> {
        return CardService.cardServer.postUserCardRead(cardUid);
    }

    public static deleteUserCardRead(cardUid: string): Observable<ServerResponse<void>> {
        return CardService.cardServer.deleteUserCardRead(cardUid);
    }

    public static postTranslateCardField(processId: string, processVersion: string, i18nValue: I18n): any {
        const fieldToTranslate = {process: processId, processVersion: processVersion, i18nValue: i18nValue};
        return CardService.cardServer
            .postTranslateCardField(fieldToTranslate)
            .pipe(map((serverResponse) => serverResponse.data));
    }

    public static fetchConnectedRecipients(lightcard: LightCard): Observable<string[]> {
        return CardService.cardServer
            .fetchConnectedRecipients(lightcard)
            .pipe(map((serverResponse) => serverResponse.data));
    }
}
