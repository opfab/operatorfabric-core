/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Observable, Subject} from 'rxjs';
import {User} from '@ofModel/user.model';
import {PermissionEnum} from '@ofModel/permission.model';
import {UserWithPerimeters} from '@ofModel/userWithPerimeters.model';
import {HttpErrorResponse} from '@angular/common/http';
import {catchError, map, takeUntil, tap} from 'rxjs/operators';
import {CrudService} from 'app/business/services/crud-service';
import {Injectable} from '@angular/core';
import {RightsEnum} from '@ofModel/perimeter.model';
import {OpfabLoggerService} from './logs/opfab-logger.service';
import {AlertMessageService} from './alert-message.service';
import {UserServer} from '../server/user.server';
import {ServerResponseStatus} from '../server/serverResponse';

@Injectable({
    providedIn: 'root'
})
export class UserService extends CrudService {
    private _userWithPerimeters: UserWithPerimeters;
    private ngUnsubscribe = new Subject<void>();
    private _userRightsPerProcessAndState: Map<string, {rights: RightsEnum; filteringNotificationAllowed: boolean}>;
    private _receiveRightPerProcess: Map<string, number>;

    /**
     * @constructor
     * @param userServer - Angular build-in
     */
    constructor(
        private userServer: UserServer,
        protected loggerService: OpfabLoggerService,
        protected alertMessageService: AlertMessageService
    ) {
        super(loggerService, alertMessageService);
        this._userRightsPerProcessAndState = new Map();
        this._receiveRightPerProcess = new Map();
    }

    deleteById(login: string) {
        return this.userServer
            .deleteById(login)
            .pipe(catchError((error: HttpErrorResponse) => this.handleError(error)));
    }

    getUser(user: string): Observable<User> {
        return this.userServer.getUser(user).pipe(
            map((userResponse) => {
                if (userResponse.status === ServerResponseStatus.OK) {
                    return userResponse.data;
                } else {
                    this.handleServerResponseError(userResponse);
                    return null;
                }
            })
        );
    }

    synchronizeWithToken(): Observable<User> {
        return this.userServer.synchronizeWithToken().pipe(
            map((userResponse) => {
                if (userResponse.status === ServerResponseStatus.OK) {
                    return userResponse.data;
                } else {
                    this.loggerService.error('Impossible to synchronize token');
                    return null;
                }
            })
        );
    }

    currentUserWithPerimeters(): Observable<UserWithPerimeters> {
        return this.userServer.currentUserWithPerimeters().pipe(
            map((userResponse) => {
                if (userResponse.status === ServerResponseStatus.OK) {
                    return userResponse.data;
                } else {
                    this.loggerService.error('Impossible to load user perimeter');
                    return null;
                }
            })
        );
    }

    queryAllUsers(): Observable<User[]> {
        return this.userServer.queryAllUsers().pipe(
            map((userResponse) => {
                if (userResponse.status === ServerResponseStatus.OK) {
                    return userResponse.data;
                } else {
                    this.handleServerResponseError(userResponse);
                    return [];
                }
            })
        );
    }

    getAll(): Observable<User[]> {
        return this.queryAllUsers();
    }

    updateUser(userData: User): Observable<User> {
        return this.userServer.updateUser(userData).pipe(
            map((userResponse) => {
                if (userResponse.status === ServerResponseStatus.OK) {
                    return userResponse.data;
                } else {
                    this.handleServerResponseError(userResponse);
                    return null;
                }
            })
        );
    }

    update(userData: User | any): Observable<User> {
        return this.updateUser(userData);
    }

    public loadUserWithPerimetersData(): Observable<any> {
        return this.currentUserWithPerimeters().pipe(
            takeUntil(this.ngUnsubscribe),
            tap({
                next: (userWithPerimeters) => {
                    if (userWithPerimeters) {
                        this._userWithPerimeters = userWithPerimeters;
                        console.log(new Date().toISOString(), 'User perimeter loaded');
                        this.loadUserRightsPerProcessAndState();
                    }
                },
                error: (error) =>
                    console.error(new Date().toISOString(), 'An error occurred when loading perimeter', error)
            })
        );
    }

    public getCurrentUserWithPerimeters(): UserWithPerimeters {
        return this._userWithPerimeters;
    }

    public isCurrentUserAdmin(): boolean {
        return this.hasCurrentUserAnyPermission([PermissionEnum.ADMIN]);
    }

    public isCurrentUserInAnyGroup(groups: string[]): boolean {
        if (!groups) return false;
        return this._userWithPerimeters.userData.groups.filter((group) => groups.indexOf(group) >= 0).length > 0;
    }

    public hasCurrentUserAnyPermission(permissions: PermissionEnum[]): boolean {
        if (!permissions) return false;
        return (
            this._userWithPerimeters.permissions.filter((permission) => permissions.indexOf(permission) >= 0).length > 0
        );
    }

    private loadUserRightsPerProcessAndState() {
        this._userRightsPerProcessAndState = new Map();
        this._userWithPerimeters.computedPerimeters.forEach((computedPerimeter) => {
            this._userRightsPerProcessAndState.set(computedPerimeter.process + '.' + computedPerimeter.state, {
                rights: computedPerimeter.rights,
                filteringNotificationAllowed: computedPerimeter.filteringNotificationAllowed
            });
            if (
                computedPerimeter.rights === RightsEnum.Receive ||
                computedPerimeter.rights === RightsEnum.ReceiveAndWrite
            )
                this._receiveRightPerProcess.set(computedPerimeter.process, 1);
        });
    }

    public isReceiveRightsForProcessAndState(processId: string, stateId: string): boolean {
        const processState = this._userRightsPerProcessAndState.get(processId + '.' + stateId);
        if (!processState) return false;
        const rights = processState.rights;
        if (rights && (rights === RightsEnum.Receive || rights === RightsEnum.ReceiveAndWrite)) {
            return true;
        }
        return false;
    }

    public isWriteRightsForProcessAndState(processId: string, stateId: string): boolean {
        const processState = this._userRightsPerProcessAndState.get(processId + '.' + stateId);
        if (!processState) {
            return false;
        }
        const rights = processState.rights;
        if (rights && (rights === RightsEnum.Write || rights === RightsEnum.ReceiveAndWrite)) {
            return true;
        }
        return false;
    }

    public isFilteringNotificationAllowedForProcessAndState(processId: string, stateId: string): boolean {
        const rightsAndFilteringNotificationAllowed = this._userRightsPerProcessAndState.get(processId + '.' + stateId);
        if (rightsAndFilteringNotificationAllowed) {
            const filteringNotificationAllowed = rightsAndFilteringNotificationAllowed.filteringNotificationAllowed;
            if (
                filteringNotificationAllowed !== null &&
                filteringNotificationAllowed !== undefined &&
                !filteringNotificationAllowed
            ) {
                return false;
            }
        }
        return true;
    }

    public isReceiveRightsForProcess(processId: string): boolean {
        return !!this._receiveRightPerProcess.get(processId);
    }

    loadConnectedUsers(): Observable<any[]> {
        return this.userServer.loadConnectedUsers().pipe(
            map((userResponse) => {
                if (userResponse.status === ServerResponseStatus.OK) {
                    return userResponse.data;
                } else {
                    this.handleServerResponseError(userResponse);
                    return [];
                }
            })
        );
    }

    willNewSubscriptionDisconnectAnExistingSubscription(): Observable<boolean> {
        return this.userServer.willNewSubscriptionDisconnectAnExistingSubscription().pipe(
            map((userResponse) => {
                if (userResponse.status === ServerResponseStatus.OK) {
                    return userResponse.data;
                } else {
                    this.loggerService.error(
                        'Impossible to check if new connection will disconnect existing subscription'
                    );
                    return null;
                }
            })
        );
    }
}
