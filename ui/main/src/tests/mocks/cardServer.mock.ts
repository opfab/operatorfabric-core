

/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {CardForPublishing, CardCreationReportData, Card} from "@ofModel/card.model";
import {CardsFilter} from "@ofModel/cards-filter.model";
import {FieldToTranslate} from "@ofModel/field-to-translate.model";
import {LightCard} from "@ofModel/light-card.model";
import {CardServer} from "app/business/server/card.server";
import {ServerResponse} from "app/business/server/serverResponse";
import {Observable, of} from "rxjs";

export class CardServerMock implements CardServer {

    private setResponseForLoadArchivedCard :Function;

    public setResponseFunctionForLoadArchivedCard(respFunc: Function) {
        this.setResponseForLoadArchivedCard = respFunc;
    }

    loadCard(id: string): Observable<ServerResponse<any>> {
        throw new Error("Method not implemented.");
    }
    loadArchivedCard(id: string): Observable<ServerResponse<any>> {
        return of(this.setResponseForLoadArchivedCard(id));
    }
    fetchFilteredArchivedCards(filter: CardsFilter): Observable<ServerResponse<any>> {
        throw new Error("Method not implemented.");
    }
    postCard(card: CardForPublishing): Observable<ServerResponse<CardCreationReportData>> {
        throw new Error("Method not implemented.");
    }
    deleteCard(card: Card): Observable<ServerResponse<any>> {
        throw new Error("Method not implemented.");
    }
    postUserCardRead(cardUid: string): Observable<ServerResponse<any>> {
        throw new Error("Method not implemented.");
    }
    deleteUserCardRead(cardUid: string): Observable<ServerResponse<any>> {
        throw new Error("Method not implemented.");
    }
    postTranslateCardField(fieldToTranslate: FieldToTranslate): Observable<ServerResponse<any>> {
        throw new Error("Method not implemented.");
    }
    fetchFilteredCards(filter: CardsFilter): Observable<ServerResponse<any>> {
        throw new Error("Method not implemented.");
    }
    fetchConnectedRecipients(lightcard: LightCard): Observable<ServerResponse<string[]>> {
        throw new Error("Method not implemented.");
    }


}