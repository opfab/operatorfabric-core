/* Copyright (c) 2023-2026, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {firstValueFrom, Observable} from 'rxjs';
import {UserSettingsServer} from './server/UserSettingsServer';
import {LogOption, LoggerService as logger} from 'app/services/logs/LoggerService';
import {CurrentUserStore} from '../../store/CurrentUserStore';
import {ServerResponse, ServerResponseStatus} from 'app/server/ServerResponse';
import {ConfigService} from '@ofServices/config/ConfigService';
import {OpfabEventStreamService} from '@ofServices/events/OpfabEventStreamService';

export class UserSettingsService {
    private static userId: string;
    private static userSettingsServer: UserSettingsServer;

    public static setUserSettingsServer(settingsServer: UserSettingsServer) {
        CurrentUserStore.getCurrentUserLogin().subscribe((id) => (UserSettingsService.userId = id));
        UserSettingsService.userSettingsServer = settingsServer;
        OpfabEventStreamService.getUserSettingsChangeRequests().subscribe(() => {
            UserSettingsService.loadCurrentUserSettings();
        });
    }

    public static reset() {
        UserSettingsService.userId = null;
    }

    public static async loadCurrentUserSettings(): Promise<void> {
        const {status, data} = await firstValueFrom(UserSettingsService.getCurrentUserSettings());
        switch (status) {
            case ServerResponseStatus.OK:
                logger.info('Settings loaded ' + JSON.stringify(data));
                ConfigService.overrideConfigSettingsWithUserSettings(data);
                break;
            case ServerResponseStatus.NOT_FOUND:
                logger.info('No settings for user');
                break;
            case ServerResponseStatus.FORBIDDEN:
                logger.error('Access forbidden when loading settings');
                return;
            default:
                logger.error('Error when loading settings' + status);
        }
    }

    private static getCurrentUserSettings(): Observable<ServerResponse<any>> {
        return UserSettingsService.userSettingsServer.getUserSettings(this.userId);
    }

    static getUserSettings(userId: string): Observable<ServerResponse<any>> {
        return UserSettingsService.userSettingsServer.getUserSettings(userId);
    }

    static patchCurrentUserSettings(settings: any): Observable<ServerResponse<any>> {
        logger.debug('Patch settings : ' + JSON.stringify(settings), LogOption.REMOTE);
        return UserSettingsService.userSettingsServer.patchUserSettings(this.userId, settings);
    }

    static patchUserSettings(userId: string, settings: any): Observable<ServerResponse<any>> {
        return UserSettingsService.userSettingsServer.patchUserSettings(userId, settings);
    }
}
