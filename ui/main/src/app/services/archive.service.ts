/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {AuthenticationService} from './authentication.service';
import {Card} from '@ofModel/card.model';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '@env/environment';
import {GuidService} from '@ofServices/guid.service';
import {LightCard} from '@ofModel/light-card.model';
import { AppState } from '../store';
import { Store } from '@ngrx/store';

@Injectable()
export class ArchiveService {
    readonly archivesUrl: string;


    constructor(private httpClient: HttpClient,  private store: Store<AppState>) {
        this.archivesUrl = `${environment.urls.cards}/archives`;
    }

    loadArchivedCard(id: string): Observable<Card> {
        return this.httpClient.get<Card>(`${this.archivesUrl}/${id}`);
    }
/*
    fetchArchivedCards(filters: {label: string, values: any}): Observable<LightCard[]> {
        let params = new HttpParams();

        
        filters.forEach((values, key) => {
            values.forEach(value => params = params.append(key, value));
        });
        
       const params1 = 'publisher=TEST1'
        return this.httpClient.get<LightCard[]>(`${this.archivesUrl}/`, {params: params1});
    }
    */
}
