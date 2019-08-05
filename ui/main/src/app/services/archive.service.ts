/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Injectable} from '@angular/core';
import {Observable, of, Subject} from 'rxjs';
import {CardOperation} from '@ofModel/card-operation.model';
import {EventSourcePolyfill} from 'ng-event-source';
import {AuthenticationService} from './authentication.service';
import {Card} from '@ofModel/card.model';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '@env/environment';
import {GuidService} from '@ofServices/guid.service';
import {LightCard} from '@ofModel/light-card.model';
import {forEach} from '@angular/router/src/utils/collection';

@Injectable()
export class ArchiveService {
    readonly unsubscribe$ = new Subject<void>();
    readonly cardOperationsUrl: string;
    readonly cardsUrl: string;
    readonly archivesUrl: string;


    constructor(private httpClient: HttpClient, private authenticationService: AuthenticationService, private guidService: GuidService) {
        const clientId = this.guidService.getCurrentGuidString();
        this.cardOperationsUrl = `${environment.urls.cards}/cardSubscription?clientId=${clientId}`;
        this.cardsUrl = `${environment.urls.cards}/cards`;
        this.archivesUrl = `${environment.urls.cards}/archives`;
    }

    loadArchivedCard(id: string): Observable<Card> {
        return this.httpClient.get<Card>(`${this.archivesUrl}/${id}`);
    }

    fetchArchivedCards(filters: Map<string, string[]>): Observable<LightCard[]> {
        let params = new HttpParams();
        filters.forEach((values, key) => {
            values.forEach(value => params = params.append(key, value));
        });
        console.log('Send request ');

        return this.httpClient.get<LightCard[]>(`${this.archivesUrl}/`, {params: params});
    }
}
