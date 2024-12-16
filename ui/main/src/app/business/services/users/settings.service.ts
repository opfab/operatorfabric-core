/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Observable} from 'rxjs';
import {SettingsServer} from '../../server/settings.server';
import {LogOption, LoggerService as logger} from 'app/services/logs/LoggerService';
import {CurrentUserStore} from '../../store/current-user.store';
import {ServerResponse} from 'app/business/server/serverResponse';

export class SettingsService {
    private static userId: string;
    private static settingsServer;

    public static setSettingsServer(settingsServer: SettingsServer) {
        CurrentUserStore.getCurrentUserLogin().subscribe((id) => (SettingsService.userId = id));
        SettingsService.settingsServer = settingsServer;
    }

    static getUserSettings(): Observable<any> {
        return SettingsService.settingsServer.getUserSettings(this.userId);
    }

    static patchUserSettings(settings: any): Observable<ServerResponse<any>> {
        logger.debug('Patch settings : ' + JSON.stringify(settings), LogOption.REMOTE);
        return SettingsService.settingsServer.patchUserSettings(this.userId, settings);
    }
}
