/* Copyright (c) 2023-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Observable, Subject} from 'rxjs';
import {User} from '@ofServices/users/model/User';
import {PermissionEnum} from '@ofServices/groups/model/PermissionEnum';
import {UserWithPerimeters} from '@ofServices/users/model/UserWithPerimeters';
import {map, takeUntil, tap} from 'rxjs/operators';
import {RightEnum} from '@ofServices/perimeters/model/Perimeter';
import {UsersServer} from './server/UsersServer';
import {ServerResponse, ServerResponseStatus} from '../../business/server/serverResponse';
import {LoggerService as logger} from 'app/services/logs/LoggerService';
import {AlertMessageService} from '@ofServices/alerteMessage/AlertMessageService';
import {MessageLevel} from '@ofServices/alerteMessage/model/Message';

export class UsersService {
    private static _userWithPerimeters: UserWithPerimeters;
    private static readonly ngUnsubscribe = new Subject<void>();
    private static _userRightsPerProcessAndState: Map<
        string,
        {rights: RightEnum; filteringNotificationAllowed: boolean}
    > = new Map();
    private static readonly _receiveRightPerProcess: Map<string, number> = new Map();
    private static usersServer: UsersServer;

    public static setUsersServer(usersServer: UsersServer) {
        UsersService.usersServer = usersServer;
    }

    public static deleteById(login: string) {
        return UsersService.usersServer.deleteById(login).pipe(
            map((userResponse: ServerResponse<any>) => {
                if (userResponse.status === ServerResponseStatus.OK) {
                    return userResponse.data;
                } else {
                    logger.error(`Error while deleting user ${login} :  ${userResponse.statusMessage}`);
                    AlertMessageService.sendAlertMessage({
                        message: '',
                        i18n: {key: 'shared.error.user.deleteUser'},
                        level: MessageLevel.ERROR
                    });
                }
            })
        );
    }

    public static getUser(user: string): Observable<User> {
        return UsersService.usersServer.getUser(user).pipe(
            map((userResponse: ServerResponse<any>) => {
                if (userResponse.status === ServerResponseStatus.OK) {
                    return userResponse.data;
                } else {
                    logger.error(`Error while getting user ${user}:  ${userResponse.statusMessage}`);
                    AlertMessageService.sendAlertMessage({
                        message: '',
                        i18n: {key: 'shared.error.user.gettingUser'},
                        level: MessageLevel.ERROR
                    });
                    return null;
                }
            })
        );
    }

    public static synchronizeWithToken(): Observable<User> {
        return UsersService.usersServer.synchronizeWithToken().pipe(
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
        return UsersService.usersServer.currentUserWithPerimeters().pipe(
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
        return UsersService.usersServer.queryAllUsers().pipe(
            map((userResponse: ServerResponse<any>) => {
                if (userResponse.status === ServerResponseStatus.OK) {
                    return userResponse.data;
                } else {
                    logger.error(`Error while getting users :  ${userResponse.statusMessage}`);
                    AlertMessageService.sendAlertMessage({
                        message: '',
                        i18n: {key: 'shared.error.user.gettingUsers'},
                        level: MessageLevel.ERROR
                    });
                    return [];
                }
            })
        );
    }

    public static getAll(): Observable<User[]> {
        return UsersService.queryAllUsers();
    }

    public static updateUser(userData: User): Observable<User> {
        return UsersService.usersServer.updateUser(userData).pipe(
            map((userResponse: ServerResponse<any>) => {
                if (userResponse.status === ServerResponseStatus.OK) {
                    return userResponse.data;
                } else {
                    logger.error(`Error while updating user ${userData.login} :  ${userResponse.statusMessage}`);
                    AlertMessageService.sendAlertMessage({
                        message: '',
                        i18n: {key: 'shared.error.user.updateUser'},
                        level: MessageLevel.ERROR
                    });
                    return null;
                }
            })
        );
    }

    public static update(userData: any): Observable<User> {
        return UsersService.updateUser(userData);
    }

    public static loadUserWithPerimetersData(): Observable<any> {
        return UsersService.currentUserWithPerimeters().pipe(
            takeUntil(UsersService.ngUnsubscribe),
            tap({
                next: (userWithPerimeters) => {
                    if (userWithPerimeters) {
                        UsersService._userWithPerimeters = userWithPerimeters;
                        logger.info('User perimeter loaded');
                        UsersService.loadUserRightsPerProcessAndState();
                    }
                },
                error: (error) =>
                    logger.error(new Date().toISOString() + 'An error occurred when loading perimeter' + error)
            })
        );
    }

    public static getCurrentUserWithPerimeters(): UserWithPerimeters {
        return UsersService._userWithPerimeters;
    }

    public static isCurrentUserAdmin(): boolean {
        return UsersService.hasCurrentUserAnyPermission([PermissionEnum.ADMIN]);
    }

    public static isCurrentUserInAnyGroup(groups: string[]): boolean {
        if (!groups) return false;
        return (
            UsersService._userWithPerimeters.userData.groups.filter((group) => groups.indexOf(group) >= 0).length > 0
        );
    }

    public static hasCurrentUserAnyPermission(permissions: PermissionEnum[]): boolean {
        if (!permissions) return false;
        return (
            UsersService._userWithPerimeters?.permissions?.filter((permission) => permissions.indexOf(permission) >= 0)
                .length > 0
        );
    }

    private static loadUserRightsPerProcessAndState() {
        UsersService._userRightsPerProcessAndState = new Map();
        UsersService._userWithPerimeters.computedPerimeters.forEach((computedPerimeter) => {
            UsersService._userRightsPerProcessAndState.set(computedPerimeter.process + '.' + computedPerimeter.state, {
                rights: computedPerimeter.rights,
                filteringNotificationAllowed: computedPerimeter.filteringNotificationAllowed
            });
            if (
                computedPerimeter.rights === RightEnum.Receive ||
                computedPerimeter.rights === RightEnum.ReceiveAndWrite
            )
                UsersService._receiveRightPerProcess.set(computedPerimeter.process, 1);
        });
    }

    public static isReceiveRightsForProcessAndState(processId: string, stateId: string): boolean {
        const processState = UsersService._userRightsPerProcessAndState.get(processId + '.' + stateId);
        if (!processState) return false;
        const rights = processState.rights;
        if (rights && (rights === RightEnum.Receive || rights === RightEnum.ReceiveAndWrite)) {
            return true;
        }
        return false;
    }

    public static isWriteRightsForProcessAndState(processId: string, stateId: string): boolean {
        const processState = UsersService._userRightsPerProcessAndState.get(processId + '.' + stateId);
        if (!processState) {
            return false;
        }
        const rights = processState.rights;
        if (rights && rights === RightEnum.ReceiveAndWrite) {
            return true;
        }
        return false;
    }

    public static isFilteringNotificationAllowedForProcessAndState(processId: string, stateId: string): boolean {
        const rightsAndFilteringNotificationAllowed = UsersService._userRightsPerProcessAndState.get(
            processId + '.' + stateId
        );
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
        return !!UsersService._receiveRightPerProcess.get(processId);
    }

    public static loadConnectedUsers(): Observable<any[]> {
        return UsersService.usersServer.loadConnectedUsers().pipe(
            map((userResponse: ServerResponse<any>) => {
                if (userResponse.status === ServerResponseStatus.OK) {
                    return userResponse.data;
                } else {
                    logger.error(`Error while getting connected users :  ${userResponse.statusMessage}`);
                    AlertMessageService.sendAlertMessage({
                        message: '',
                        i18n: {key: 'admin.errors.user.gettingConnectingUsers'},
                        level: MessageLevel.ERROR
                    });
                    return [];
                }
            })
        );
    }

    public static willNewSubscriptionDisconnectAnExistingSubscription(): Observable<boolean> {
        return UsersService.usersServer.willNewSubscriptionDisconnectAnExistingSubscription().pipe(
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
