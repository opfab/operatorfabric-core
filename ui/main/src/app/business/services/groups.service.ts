/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Observable, Subject} from 'rxjs';
import {Group} from '@ofModel/group.model';
import {environment} from '@env/environment';
import {takeUntil, tap, map} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {CachedCrudService} from 'app/business/services/cached-crud-service';
import {OpfabLoggerService} from './logs/opfab-logger.service';
import {AlertMessageService} from './alert-message.service';
import {GroupsServer} from '../server/groups.server';
import {ServerResponseStatus} from '../server/serverResponse';

@Injectable({
    providedIn: 'root'
})
export class GroupsService extends CachedCrudService {
    readonly groupsUrl: string;
    private _groups: Group[];

    private ngUnsubscribe$ = new Subject<void>();

    /**
     * @constructor
     * @param httpClient - Angular build-in
     */
    constructor(
        protected loggerService: OpfabLoggerService, 
        protected alertMessageService: AlertMessageService,
        private groupsServer: GroupsServer) {
        super(loggerService, alertMessageService);
        this.groupsUrl = `${environment.urls.groups}`;
    }

    deleteById(id: string) {
        return this.groupsServer.deleteById(id).pipe(
            tap((groupsResponse) => {
                if (groupsResponse.status === ServerResponseStatus.OK) {
                    this.deleteFromCachedGroups(id);
                } else {
                    this.handleServerResponseError(groupsResponse);
                }
            })
        );
    }

    private deleteFromCachedGroups(id: string): void {
        this._groups = this._groups.filter((group) => group.id !== id);
    }

    private updateCachedGroups(groupData: Group): void {
        const updatedGroups = this._groups.filter((group) => group.id !== groupData.id);
        updatedGroups.push(groupData);
        this._groups = updatedGroups;
    }

    private queryAllGroups(): Observable<Group[]> {
        return this.groupsServer.queryAllGroups().pipe(
            map(((groupsResponse) => {
                if (groupsResponse.status === ServerResponseStatus.OK) {
                    return groupsResponse.data;
                } else {
                    this.handleServerResponseError(groupsResponse);
                    return [];
                }
            }))
            );
    }

    public loadAllGroupsData(): Observable<any> {
        return this.queryAllGroups().pipe(
            takeUntil(this.ngUnsubscribe$),
            tap({
                next: (groups) => {
                    if (!!groups) {
                        this._groups = groups;
                        console.log(new Date().toISOString(), 'List of groups loaded');
                    }
                },
                error: (error) => console.error(new Date().toISOString(), 'an error occurred', error)
            })
        );
    }

    public getGroups(): Group[] {
        return this._groups;
    }

    public getCachedValues(): Array<Group> {
        return this.getGroups();
    }

    updateGroup(groupData: Group): Observable<Group> {
        return this.groupsServer.updateGroup(groupData).pipe(
            map((groupsResponse) => {
                if (groupsResponse.status === ServerResponseStatus.OK) {
                    this.updateCachedGroups(groupData);
                    return groupsResponse.data;
                } else {
                    this.handleServerResponseError(groupsResponse);
                    return null;
                }
            })
        );
    }

    public getGroupName(idGroup: string): string {
        const found = this._groups.find((group) => group.id === idGroup);
        if (found && found.name) return found.name;

        return idGroup;
    }

    public isRealtimeGroup(idGroup: string): boolean {
        const found = this._groups.find((group) => group.id === idGroup);
        return found && found.realtime;
    }

    getAll(): Observable<any[]> {
        return this.queryAllGroups();
    }

    update(data: any): Observable<any> {
        return this.updateGroup(data);
    }
}
