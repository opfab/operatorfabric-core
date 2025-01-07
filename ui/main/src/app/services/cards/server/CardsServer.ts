/* Copyright (c) 2023-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {CardsFilter} from '@ofServices/cards/model/CardsFilter';
import {CardForPublishing, Card, CardCreationReportData} from '@ofServices/cards/model/Card';
import {FieldToTranslate} from '@ofServices/cards/model/FieldToTranslate';
import {Observable} from 'rxjs';
import {ServerResponse} from '../../../business/server/serverResponse';
import {LightCard} from '@ofModel/light-card.model';

export abstract class CardsServer {
    abstract loadCard(id: string): Observable<ServerResponse<any>>;
    abstract loadArchivedCard(id: string): Observable<ServerResponse<any>>;
    abstract fetchFilteredArchivedCards(filter: CardsFilter): Observable<ServerResponse<any>>;
    abstract fetchFilteredCards(filter: CardsFilter): Observable<ServerResponse<any>>;
    abstract postCard(card: CardForPublishing): Observable<ServerResponse<CardCreationReportData>>;
    abstract deleteCard(card: Card): Observable<ServerResponse<any>>;
    abstract postUserCardRead(cardUid: string): Observable<ServerResponse<any>>;
    abstract deleteUserCardRead(cardUid: string): Observable<ServerResponse<any>>;
    abstract postTranslateCardField(fieldToTranslate: FieldToTranslate): Observable<ServerResponse<any>>;
    abstract fetchConnectedRecipients(lightcard: LightCard): Observable<ServerResponse<string[]>>;
}
