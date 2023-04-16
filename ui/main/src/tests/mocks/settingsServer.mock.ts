

/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {ServerResponse} from "app/business/server/serverResponse";
import {SettingsServer} from "app/business/server/settings.server";
import {Observable, ReplaySubject} from "rxjs";

export class SettingsServerMock implements SettingsServer {

    public userIdPatch = "";
    public settingsPatch = {};


    private patchUserSettings$: ReplaySubject<ServerResponse<any>>;

    public setResponseForPatchUserSettings(response: ServerResponse<any>) {
        this.patchUserSettings$ = new ReplaySubject<ServerResponse<any>>();
        this.patchUserSettings$.next(response);
        this.patchUserSettings$.complete();
    }

    getUserSettings(userId: string): Observable<ServerResponse<any>> {
        throw new Error("Method not implemented.");
    }

    patchUserSettings(userId: string, settings: any): Observable<ServerResponse<any>> {
        this.userIdPatch = userId;
        this.settingsPatch = settings;
        return this.patchUserSettings$.asObservable();
    }
}