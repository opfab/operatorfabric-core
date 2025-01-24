/* Copyright (c) 2018-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */
import {Observable} from 'rxjs';
import {CardForPublishing} from './model/CardForPublishing';
import {CardWithChildCards} from './model/CardWithChildCards';
import {CardCreationReportData} from './model/CardCreationReportData';
import {map} from 'rxjs/operators';
import {I18n} from 'app/model/I18n';
import {CardsFilter} from '@ofServices/cards/model/CardsFilter';
import {CardsServer} from './server/CardsServer';
import {ServerResponse, ServerResponseStatus} from '../../server/ServerResponse';
import {AcknowledgeService} from '../acknowlegment/AcknowledgeService';
import {Card} from 'app/model/Card';
import {FieldToTranslate} from './model/FieldToTranslate';

export class CardsService {
    private static cardsServer: CardsServer;

    public static setCardsServer(cardsServer: CardsServer) {
        CardsService.cardsServer = cardsServer;
    }

    public static loadCard(id: string): Observable<CardWithChildCards> {
        return CardsService.cardsServer.loadCard(id).pipe(
            map((cardResponse) => {
                if (cardResponse.status === ServerResponseStatus.OK) {
                    const cardData = cardResponse.data;
                    cardData.card.hasBeenAcknowledged =
                        AcknowledgeService.hasLightCardBeenAcknowledgedByUserOrByUserEntity(cardData.card);
                    return cardData;
                }
            })
        );
    }

    public static loadArchivedCard(id: string): Observable<CardWithChildCards> {
        return CardsService.cardsServer.loadArchivedCard(id).pipe(map((serverResponse) => serverResponse.data));
    }

    public static fetchFilteredArchivedCards(filter: CardsFilter) {
        return CardsService.cardsServer
            .fetchFilteredArchivedCards(filter)
            .pipe(map((serverResponse) => serverResponse.data));
    }

    public static fetchFilteredCards(filter: CardsFilter) {
        return CardsService.cardsServer.fetchFilteredCards(filter).pipe(map((serverResponse) => serverResponse.data));
    }

    public static postCard(card: CardForPublishing): Observable<ServerResponse<CardCreationReportData>> {
        return CardsService.cardsServer.postCard(card);
    }

    public static deleteCard(card: Card): Observable<ServerResponse<void>> {
        return CardsService.cardsServer.deleteCard(card);
    }

    public static postUserCardRead(cardUid: string): Observable<ServerResponse<void>> {
        return CardsService.cardsServer.postUserCardRead(cardUid);
    }

    public static deleteUserCardRead(cardUid: string): Observable<ServerResponse<void>> {
        return CardsService.cardsServer.deleteUserCardRead(cardUid);
    }

    public static postTranslateCardField(processId: string, processVersion: string, i18nValue: I18n): any {
        const fieldToTranslate = new FieldToTranslate(processId, processVersion, i18nValue);
        return CardsService.cardsServer
            .postTranslateCardField(fieldToTranslate)
            .pipe(map((serverResponse) => serverResponse.data));
    }

    public static fetchConnectedRecipients(lightcard: Card): Observable<string[]> {
        return CardsService.cardsServer
            .fetchConnectedRecipients(lightcard)
            .pipe(map((serverResponse) => serverResponse.data));
    }
}
