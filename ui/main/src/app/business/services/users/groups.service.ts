/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Observable, Subject} from 'rxjs';
import {Group} from '@ofModel/group.model';
import {takeUntil, tap, map} from 'rxjs/operators';
import {GroupsServer} from '../../server/groups.server';
import {ServerResponseStatus} from '../../server/serverResponse';
import {ErrorService} from '../error-service';
import {LoggerService} from '../logs/logger.service';

export class GroupsService {
    private static _groups: Group[];
    private static groupsServer: GroupsServer;

    private static readonly ngUnsubscribe$ = new Subject<void>();

    public static setGroupsServer(groupsServer: GroupsServer) {
        GroupsService.groupsServer = groupsServer;
    }

    public static deleteById(id: string) {
        return GroupsService.groupsServer.deleteById(id).pipe(
            tap((groupsResponse) => {
                if (groupsResponse.status === ServerResponseStatus.OK) {
                    GroupsService.deleteFromCachedGroups(id);
                } else {
                    ErrorService.handleServerResponseError(groupsResponse);
                }
            })
        );
    }

    private static deleteFromCachedGroups(id: string): void {
        GroupsService._groups = GroupsService._groups.filter((group) => group.id !== id);
    }

    private static updateCachedGroups(groupData: Group): void {
        const updatedGroups = GroupsService._groups.filter((group) => group.id !== groupData.id);
        updatedGroups.push(groupData);
        GroupsService._groups = updatedGroups;
    }

    private static queryAllGroups(): Observable<Group[]> {
        return GroupsService.groupsServer.queryAllGroups().pipe(
            map((groupsResponse) => {
                if (groupsResponse.status === ServerResponseStatus.OK) {
                    return groupsResponse.data;
                } else {
                    ErrorService.handleServerResponseError(groupsResponse);
                    return [];
                }
            })
        );
    }

    public static loadAllGroupsData(): Observable<any> {
        return GroupsService.queryAllGroups().pipe(
            takeUntil(GroupsService.ngUnsubscribe$),
            tap({
                next: (groups) => {
                    if (groups) {
                        GroupsService._groups = groups;
                        LoggerService.info('List of groups loaded');
                    }
                },
                error: (error) => LoggerService.error('an error occurred when loading groups' + error)
            })
        );
    }

    public static getGroups(): Group[] {
        return GroupsService._groups;
    }

    public static getGroup(groupId): Group {
        const group = GroupsService._groups.find((group) => group.id === groupId);
        return group;
    }

    public static getCachedValues(): Array<Group> {
        return GroupsService.getGroups();
    }

    public static updateGroup(groupData: Group): Observable<Group> {
        return GroupsService.groupsServer.updateGroup(groupData).pipe(
            map((groupsResponse) => {
                if (groupsResponse.status === ServerResponseStatus.OK) {
                    GroupsService.updateCachedGroups(groupData);
                    return groupsResponse.data;
                } else {
                    ErrorService.handleServerResponseError(groupsResponse);
                    return null;
                }
            })
        );
    }

    public static getGroupName(idGroup: string): string {
        const found = GroupsService._groups.find((group) => group.id === idGroup);
        if (found?.name) return found.name;

        return idGroup;
    }

    public static getAll(): Observable<any[]> {
        return GroupsService.queryAllGroups();
    }

    public static update(data: any): Observable<any> {
        return GroupsService.updateGroup(data);
    }
}
