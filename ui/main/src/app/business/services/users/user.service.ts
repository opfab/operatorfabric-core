/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Observable, Subject} from 'rxjs';
import {User} from '@ofModel/user.model';
import {PermissionEnum} from '@ofServices/groups/model/PermissionEnum';
import {UserWithPerimeters} from '@ofModel/userWithPerimeters.model';
import {map, takeUntil, tap} from 'rxjs/operators';
import {RightsEnum} from '@ofModel/perimeter.model';
import {UserServer} from '../../server/user.server';
import {ServerResponse, ServerResponseStatus} from '../../server/serverResponse';
import {LoggerService as logger} from 'app/services/logs/LoggerService';
import {ErrorService} from '../error-service';

export class UserService {
    private static _userWithPerimeters: UserWithPerimeters;
    private static readonly ngUnsubscribe = new Subject<void>();
    private static _userRightsPerProcessAndState: Map<
        string,
        {rights: RightsEnum; filteringNotificationAllowed: boolean}
    > = new Map();
    private static readonly _receiveRightPerProcess: Map<string, number> = new Map();
    private static userServer;

    public static setUserServer(userServer: UserServer) {
        UserService.userServer = userServer;
    }

    public static deleteById(login: string) {
        return UserService.userServer.deleteById(login).pipe(
            map((userResponse: ServerResponse<any>) => {
                if (userResponse.status === ServerResponseStatus.OK) {
                    return userResponse.data;
                } else {
                    ErrorService.handleServerResponseError(userResponse);
                    return null;
                }
            })
        );
    }

    public static getUser(user: string): Observable<User> {
        return UserService.userServer.getUser(user).pipe(
            map((userResponse: ServerResponse<any>) => {
                if (userResponse.status === ServerResponseStatus.OK) {
                    return userResponse.data;
                } else {
                    ErrorService.handleServerResponseError(userResponse);
                    return null;
                }
            })
        );
    }

    public static synchronizeWithToken(): Observable<User> {
        return UserService.userServer.synchronizeWithToken().pipe(
            map((userResponse: ServerResponse<any>) => {
                if (userResponse.status === ServerResponseStatus.OK) {
                    return userResponse.data;
                } else {
                    logger.error('Impossible to synchronize token');
                    return null;
                }
            })
        );
    }

    public static currentUserWithPerimeters(): Observable<UserWithPerimeters> {
        return UserService.userServer.currentUserWithPerimeters().pipe(
            map((userResponse: ServerResponse<any>) => {
                if (userResponse.status === ServerResponseStatus.OK) {
                    return userResponse.data;
                } else {
                    logger.error('Impossible to load user perimeter');
                    return null;
                }
            })
        );
    }

    public static queryAllUsers(): Observable<User[]> {
        return UserService.userServer.queryAllUsers().pipe(
            map((userResponse: ServerResponse<any>) => {
                if (userResponse.status === ServerResponseStatus.OK) {
                    return userResponse.data;
                } else {
                    ErrorService.handleServerResponseError(userResponse);
                    return [];
                }
            })
        );
    }

    public static getAll(): Observable<User[]> {
        return this.queryAllUsers();
    }

    public static updateUser(userData: User): Observable<User> {
        return UserService.userServer.updateUser(userData).pipe(
            map((userResponse: ServerResponse<any>) => {
                if (userResponse.status === ServerResponseStatus.OK) {
                    return userResponse.data;
                } else {
                    ErrorService.handleServerResponseError(userResponse);
                    return null;
                }
            })
        );
    }

    public static update(userData: any): Observable<User> {
        return UserService.updateUser(userData);
    }

    public static loadUserWithPerimetersData(): Observable<any> {
        return this.currentUserWithPerimeters().pipe(
            takeUntil(this.ngUnsubscribe),
            tap({
                next: (userWithPerimeters) => {
                    if (userWithPerimeters) {
                        UserService._userWithPerimeters = userWithPerimeters;
                        logger.info('User perimeter loaded');
                        UserService.loadUserRightsPerProcessAndState();
                    }
                },
                error: (error) =>
                    logger.error(new Date().toISOString() + 'An error occurred when loading perimeter' + error)
            })
        );
    }

    public static getCurrentUserWithPerimeters(): UserWithPerimeters {
        return UserService._userWithPerimeters;
    }

    public static isCurrentUserAdmin(): boolean {
        return UserService.hasCurrentUserAnyPermission([PermissionEnum.ADMIN]);
    }

    public static isCurrentUserInAnyGroup(groups: string[]): boolean {
        if (!groups) return false;
        return UserService._userWithPerimeters.userData.groups.filter((group) => groups.indexOf(group) >= 0).length > 0;
    }

    public static hasCurrentUserAnyPermission(permissions: PermissionEnum[]): boolean {
        if (!permissions) return false;
        return (
            UserService._userWithPerimeters?.permissions?.filter((permission) => permissions.indexOf(permission) >= 0)
                .length > 0
        );
    }

    private static loadUserRightsPerProcessAndState() {
        UserService._userRightsPerProcessAndState = new Map();
        UserService._userWithPerimeters.computedPerimeters.forEach((computedPerimeter) => {
            UserService._userRightsPerProcessAndState.set(computedPerimeter.process + '.' + computedPerimeter.state, {
                rights: computedPerimeter.rights,
                filteringNotificationAllowed: computedPerimeter.filteringNotificationAllowed
            });
            if (
                computedPerimeter.rights === RightsEnum.Receive ||
                computedPerimeter.rights === RightsEnum.ReceiveAndWrite
            )
                UserService._receiveRightPerProcess.set(computedPerimeter.process, 1);
        });
    }

    public static isReceiveRightsForProcessAndState(processId: string, stateId: string): boolean {
        const processState = UserService._userRightsPerProcessAndState.get(processId + '.' + stateId);
        if (!processState) return false;
        const rights = processState.rights;
        if (rights && (rights === RightsEnum.Receive || rights === RightsEnum.ReceiveAndWrite)) {
            return true;
        }
        return false;
    }

    public static isWriteRightsForProcessAndState(processId: string, stateId: string): boolean {
        const processState = UserService._userRightsPerProcessAndState.get(processId + '.' + stateId);
        if (!processState) {
            return false;
        }
        const rights = processState.rights;
        if (rights && rights === RightsEnum.ReceiveAndWrite) {
            return true;
        }
        return false;
    }

    public static isFilteringNotificationAllowedForProcessAndState(processId: string, stateId: string): boolean {
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

    public static isReceiveRightsForProcess(processId: string): boolean {
        return !!this._receiveRightPerProcess.get(processId);
    }

    public static loadConnectedUsers(): Observable<any[]> {
        return this.userServer.loadConnectedUsers().pipe(
            map((userResponse: ServerResponse<any>) => {
                if (userResponse.status === ServerResponseStatus.OK) {
                    return userResponse.data;
                } else {
                    ErrorService.handleServerResponseError(userResponse);
                    return [];
                }
            })
        );
    }

    public static willNewSubscriptionDisconnectAnExistingSubscription(): Observable<boolean> {
        return this.userServer.willNewSubscriptionDisconnectAnExistingSubscription().pipe(
            map((userResponse: ServerResponse<any>) => {
                if (userResponse.status === ServerResponseStatus.OK) {
                    return userResponse.data;
                } else {
                    logger.error('Impossible to check if new connection will disconnect existing subscription');
                    return null;
                }
            })
        );
    }
}
