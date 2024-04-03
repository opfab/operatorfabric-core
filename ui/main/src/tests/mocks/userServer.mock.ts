/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
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
