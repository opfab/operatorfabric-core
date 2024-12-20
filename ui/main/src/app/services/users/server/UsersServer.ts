/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {User} from '@ofServices/users/model/User';
import {UserWithPerimeters} from '@ofServices/users/model/UserWithPerimeters';
import {Observable} from 'rxjs';
import {ServerResponse} from '../../../business/server/serverResponse';

export abstract class UsersServer {
    abstract deleteById(login: string): Observable<ServerResponse<any>>;
    abstract getUser(user: string): Observable<ServerResponse<User>>;
    abstract synchronizeWithToken(): Observable<ServerResponse<User>>;
    abstract currentUserWithPerimeters(): Observable<ServerResponse<UserWithPerimeters>>;
    abstract queryAllUsers(): Observable<ServerResponse<User[]>>;
    abstract updateUser(userData: User): Observable<ServerResponse<User>>;
    abstract loadConnectedUsers(): Observable<ServerResponse<any[]>>;
    abstract willNewSubscriptionDisconnectAnExistingSubscription(): Observable<ServerResponse<boolean>>;
}
