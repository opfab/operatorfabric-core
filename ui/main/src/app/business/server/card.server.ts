/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {CardsFilter} from '@ofModel/cards-filter.model';
import {CardForPublishing, Card, CardCreationReportData} from '@ofModel/card.model';
import {FieldToTranslate} from '@ofModel/field-to-translate.model';
import {Observable} from 'rxjs';
import {ServerResponse} from './serverResponse';

export abstract class CardServer {

    abstract loadCard(id: string): Observable<ServerResponse<any>>;
    abstract loadArchivedCard(id: string): Observable<ServerResponse<any>>;
    abstract fetchFilteredArchivedCards(filter: CardsFilter): Observable<ServerResponse<any>>;
    abstract postCard(card: CardForPublishing): Observable<ServerResponse<CardCreationReportData>>;
    abstract deleteCard(card: Card): Observable<ServerResponse<any>>;
    abstract postUserCardRead(cardUid: string): Observable<ServerResponse<any>>;
    abstract deleteUserCardRead(cardUid: string): Observable<ServerResponse<any>>;
    abstract postTranslateCardField(fieldToTranslate: FieldToTranslate): Observable<ServerResponse<any>>;
}