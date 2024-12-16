/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {AuthService} from 'app/authentication/auth.service';
import {Observable, Subject} from 'rxjs';
import {CurrentUserStore} from '../store/current-user.store';
import {OpfabEventStreamService} from './events/opfabEventStream.service';
import {LogOption, LoggerService as logger} from 'app/services/logs/LoggerService';
import {SoundNotificationService} from './notifications/sound-notification.service';

export class SessionManagerService {
    private static readonly endSessionEvent = new Subject<string>();
    private static authService: AuthService;

    public static init(authService: AuthService) {
        this.authService = authService;
        this.subscribeToSessionWillSoonExpire();
        this.subscribeToSessionExpired();
        this.subscribeToSessionClosedByNewUser();
    }

    private static subscribeToSessionWillSoonExpire() {
        CurrentUserStore.getSessionWillSoonExpire().subscribe(() => {
            // We inform the user that session is end before it really ends
            // this lets the time for the UI to call external-devices services to send alarm
            // otherwise the call for alarm would be reject as token will have expired
            logger.info('Session will soon expire ', LogOption.REMOTE);
            SoundNotificationService.handleSessionEnd();
            this.endSessionEvent.next('SessionEnd');
        });
    }

    private static subscribeToSessionExpired() {
        CurrentUserStore.getSessionExpired().subscribe(() => {
            logger.info('Session expired');
            // If session is expired, all requests to external devices will fail
            // so we can stop sending request to external devices
            if (SoundNotificationService.getPlaySoundOnExternalDevice())
                SoundNotificationService.clearOutstandingNotifications();
            OpfabEventStreamService.closeEventStream();
        });
    }

    private static subscribeToSessionClosedByNewUser() {
        OpfabEventStreamService.getReceivedDisconnectUser().subscribe((isDisconnected) => {
            if (isDisconnected) {
                SoundNotificationService.stopService();
                this.endSessionEvent.next('DisconnectedByNewUser');
            }
        });
    }

    public static getEndSessionEvent(): Observable<string> {
        return this.endSessionEvent.asObservable();
    }

    public static logout() {
        logger.info('Logout : end session ', LogOption.REMOTE);
        SoundNotificationService.stopService();
        OpfabEventStreamService.closeEventStream();
        this.authService.logout();
    }
}
