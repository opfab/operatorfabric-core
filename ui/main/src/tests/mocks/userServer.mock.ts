/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {UserServer} from 'app/business/server/user.server';
import {ServerResponse} from 'app/business/server/serverResponse';
import {Observable, ReplaySubject} from 'rxjs';
import {User} from '@ofModel/user.model';
import {UserWithPerimeters} from '@ofModel/userWithPerimeters.model';

export class UserServerMock implements UserServer {
    private currentUserWithPerimeterSubject = new ReplaySubject<ServerResponse<UserWithPerimeters>>();

    setResponseForCurrentUserWithPerimeter(currentUserWithPerimeter: ServerResponse<UserWithPerimeters>) {
        this.currentUserWithPerimeterSubject.next(currentUserWithPerimeter);
    }

    deleteById(login: string): Observable<ServerResponse<any>> {
        throw new Error('Method not implemented.');
    }
    getUser(user: string): Observable<ServerResponse<User>> {
        throw new Error('Method not implemented.');
    }
    synchronizeWithToken(): Observable<ServerResponse<User>> {
        throw new Error('Method not implemented.');
    }
    currentUserWithPerimeters(): Observable<ServerResponse<UserWithPerimeters>> {
        return this.currentUserWithPerimeterSubject.asObservable();
    }
    queryAllUsers(): Observable<ServerResponse<User[]>> {
        throw new Error('Method not implemented.');
    }
    updateUser(userData: User): Observable<ServerResponse<User>> {
        throw new Error('Method not implemented.');
    }
    loadConnectedUsers(): Observable<ServerResponse<any[]>> {
        throw new Error('Method not implemented.');
    }
    willNewSubscriptionDisconnectAnExistingSubscription(): Observable<ServerResponse<boolean>> {
        throw new Error('Method not implemented.');
    }
}
