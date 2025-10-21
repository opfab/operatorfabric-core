/* Copyright (c) 2023-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {UsersServer} from '@ofServices/users/server/UsersServer';
import {ServerResponse} from 'app/server/ServerResponse';
import {Observable, ReplaySubject} from 'rxjs';
import {User} from '@ofServices/users/model/User';
import {UserWithPerimeters} from '@ofServices/users/model/UserWithPerimeters';

export class UsersServerMock implements UsersServer {
    private currentUserWithPerimeterSubject: ReplaySubject<ServerResponse<UserWithPerimeters>>;
    private userSubject: ReplaySubject<ServerResponse<User>>;
    private connectedUsersSubject: ReplaySubject<ServerResponse<any>>;
    private queryAllUsersSubject: ReplaySubject<ServerResponse<any>>;
    public numberOfCallsToCurrentUserWithPerimeter = 0;

    setResponseForCurrentUserWithPerimeter(currentUserWithPerimeter: ServerResponse<UserWithPerimeters>) {
        this.currentUserWithPerimeterSubject = new ReplaySubject<ServerResponse<UserWithPerimeters>>();
        this.currentUserWithPerimeterSubject.next(currentUserWithPerimeter);
        this.currentUserWithPerimeterSubject.complete();
    }

    setResponseForUser(user: ServerResponse<User>) {
        this.userSubject = new ReplaySubject<ServerResponse<User>>();
        this.userSubject.next(user);
        this.userSubject.complete();
    }

    setResponseForConnectedUsers(connectedUsers: ServerResponse<any>) {
        this.connectedUsersSubject = new ReplaySubject<ServerResponse<any>>();
        this.connectedUsersSubject.next(connectedUsers);
        this.connectedUsersSubject.complete();
    }

    setResponseForQueryAllUsers(users: ServerResponse<User[]>) {
        this.queryAllUsersSubject = new ReplaySubject<ServerResponse<any>>();
        this.queryAllUsersSubject.next(users);
        this.queryAllUsersSubject.complete();
    }

    deleteById(login: string): Observable<ServerResponse<any>> {
        throw new Error('Method not implemented.');
    }
    getUser(user: string): Observable<ServerResponse<User>> {
        return this.userSubject.asObservable();
    }
    synchronizeWithToken(): Observable<ServerResponse<User>> {
        throw new Error('Method not implemented.');
    }
    currentUserWithPerimeters(): Observable<ServerResponse<UserWithPerimeters>> {
        this.numberOfCallsToCurrentUserWithPerimeter++;
        return this.currentUserWithPerimeterSubject.asObservable();
    }
    queryAllUsers(): Observable<ServerResponse<User[]>> {
        return this.queryAllUsersSubject.asObservable();
    }
    updateUser(userData: User): Observable<ServerResponse<User>> {
        throw new Error('Method not implemented.');
    }
    loadConnectedUsers(): Observable<ServerResponse<any[]>> {
        return this.connectedUsersSubject.asObservable();
    }
    willNewSubscriptionDisconnectAnExistingSubscription(): Observable<ServerResponse<boolean>> {
        throw new Error('Method not implemented.');
    }
}
