/* Copyright (c) 2023-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Observable} from 'rxjs';
import {UserSettingsServer} from './server/UserSettingsServer';
import {LogOption, LoggerService as logger} from 'app/services/logs/LoggerService';
import {CurrentUserStore} from '../../store/CurrentUserStore';
import {ServerResponse} from 'app/server/ServerResponse';

export class UserSettingsService {
    private static userId: string;
    private static userSettingsServer: UserSettingsServer;

    public static setUserSettingsServer(settingsServer: UserSettingsServer) {
        CurrentUserStore.getCurrentUserLogin().subscribe((id) => (UserSettingsService.userId = id));
        UserSettingsService.userSettingsServer = settingsServer;
    }

    static getUserSettings(): Observable<any> {
        return UserSettingsService.userSettingsServer.getUserSettings(this.userId);
    }

    static patchUserSettings(settings: any): Observable<ServerResponse<any>> {
        logger.debug('Patch settings : ' + JSON.stringify(settings), LogOption.REMOTE);
        return UserSettingsService.userSettingsServer.patchUserSettings(this.userId, settings);
    }
}
