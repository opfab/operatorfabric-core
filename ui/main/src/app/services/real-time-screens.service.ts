/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Observable, Subject} from 'rxjs';
import {environment} from '@env/environment';
import {HttpClient} from '@angular/common/http';
import {Injectable, OnDestroy} from '@angular/core';
import {RealTimeScreens} from '@ofModel/real-time-screens.model';
import {takeUntil, tap} from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class RealTimeScreensService implements OnDestroy {
    readonly realTimeScreensUrl: string;
    private _realTimeScreens: RealTimeScreens;

    private ngUnsubscribe$ = new Subject<void>();

    /**
     * @constructor
     * @param httpClient - Angular build-in
     */
    constructor(private httpClient: HttpClient) {
        this.realTimeScreensUrl = `${environment.urls.realTimeScreens}`;
    }

    ngOnDestroy() {
        this.ngUnsubscribe$.next();
        this.ngUnsubscribe$.complete();
    }

    fetchRealTimeScreens(): Observable<RealTimeScreens> {
        return this.httpClient.get<RealTimeScreens>(`${this.realTimeScreensUrl}`);
    }

    public loadRealTimeScreensData(): Observable<any> {
        return this.fetchRealTimeScreens().pipe(
            takeUntil(this.ngUnsubscribe$),
            tap({
                next: (realTimeScreens) => {
                    if (!!realTimeScreens) {
                        this._realTimeScreens = realTimeScreens;
                        console.log(new Date().toISOString(), 'List of realTimeScreens loaded');
                    }
                },
                error: (error) => console.error(new Date().toISOString(), 'an error occurred', error)
            })
        );
    }

    public getRealTimeScreens(): RealTimeScreens {
        return this._realTimeScreens;
    }
}
