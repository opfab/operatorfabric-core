/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Observable} from 'rxjs';
import {environment} from '@env/environment';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Perimeter} from '@ofModel/perimeter.model';;
import {PerimetersServer} from 'app/business/server/perimeters.server';
import {ServerResponse} from 'app/business/server/serverResponse';
import {AngularServer} from './angular.server';


@Injectable({
    providedIn: 'root'
})
export class AngularPerimetersServer extends AngularServer implements PerimetersServer {
    readonly perimetersUrl: string;

    /**
     * @constructor
     * @param httpClient - Angular build-in
     */
    constructor(private httpClient: HttpClient) {
        super();
        this.perimetersUrl = `${environment.urls.perimeters}`;
    }

    deleteById(id: string): Observable<ServerResponse<any>> {
        const url = `${this.perimetersUrl}/${id}`;
        return this.processHttpResponse(this.httpClient.delete(url));
    }

    queryAllPerimeters(): Observable<ServerResponse<Perimeter[]>>{
        return this.processHttpResponse(this.httpClient.get<Perimeter[]>(`${this.perimetersUrl}`));
    }

    createPerimeter(perimeterData: Perimeter): Observable<ServerResponse<Perimeter>> {
        return this.processHttpResponse(this.httpClient.post<Perimeter>(`${this.perimetersUrl}`, perimeterData));
    }

    updatePerimeter(perimeterData: Perimeter): Observable<ServerResponse<Perimeter>>{
        return this.processHttpResponse(this.httpClient.put<Perimeter>(`${this.perimetersUrl}` + '/' + perimeterData.id, perimeterData));
    }

}
