/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {SettingsServer} from "../../server/settings.server";
import {LogOption, OpfabLoggerService} from 'app/business/services/logs/opfab-logger.service';
import {CurrentUserStore} from "../../store/current-user.store";


@Injectable({
    providedIn: 'root'
})
export class SettingsService {
    readonly usersUrl: string;
    private userId: string;

    constructor(
        private settingsServer: SettingsServer,
        private logger: OpfabLoggerService,
        private currentUserStore: CurrentUserStore
        ) {
            this.currentUserStore.getCurrentUserLogin().subscribe((id) => (this.userId = id));
        }

    getUserSettings(): Observable<any> {
        return this.settingsServer.getUserSettings(this.userId);
    }

    patchUserSettings(settings: any): Observable<any> {
        this.logger.debug("Patch settings : " + JSON.stringify(settings),LogOption.REMOTE);
        return this.settingsServer.patchUserSettings(this.userId, settings);
    }
}