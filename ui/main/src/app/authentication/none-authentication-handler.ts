/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {AuthenticatedUser} from './auth.model';
import {AuthHandler} from './auth-handler';
import {UsersService} from '@ofServices/users/UsersService';
import {Message, MessageLevel} from '@ofServices/alerteMessage/model/Message';
import {LoggerService as logger} from 'app/services/logs/LoggerService';

export class NoneAuthenticationHandler extends AuthHandler {
    initializeAuthentication() {
        UsersService.currentUserWithPerimeters().subscribe((foundUser) => {
            if (foundUser != null) {
                logger.info('None auth mode - User (' + foundUser.userData.login + ') found');
                const user = new AuthenticatedUser();
                user.login = foundUser.userData.login;
                this.userAuthenticated.next(user);
            } else {
                logger.error('None auth mode - Unable to authenticate the user');
                this.rejectAuthentication.next(new Message('Unable to authenticate user', MessageLevel.ERROR));
            }
        });
    }

    regularCheckIfTokenExpireSoon() {
        // Override because there is no regularly check in none mode
    }

    regularCheckIfTokenIsExpired() {
        // Override because there is no regularly check in none mode
    }
}
