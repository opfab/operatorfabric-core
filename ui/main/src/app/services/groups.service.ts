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
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {catchError, takeUntil, tap} from 'rxjs/operators';
import {Injectable, OnDestroy} from '@angular/core';
import {CachedCrudService} from '@ofServices/cached-crud-service';
import {OpfabLoggerService} from '../business/services/logs/opfab-logger.service';
import {AlertMessageService} from '../business/services/alert-message.service';
@Injectable({
    providedIn: 'root'
})
export class GroupsService extends CachedCrudService implements OnDestroy {
    readonly groupsUrl: string;
    private _groups: Group[];

    private ngUnsubscribe$ = new Subject<void>();

    /**
     * @constructor
     * @param httpClient - Angular build-in
     */
    constructor( private httpClient: HttpClient, protected loggerService: OpfabLoggerService, protected alertMessageService: AlertMessageService) {
        super(loggerService, alertMessageService);
        this.groupsUrl = `${environment.urls.groups}`;
    }

    ngOnDestroy() {
        this.ngUnsubscribe$.next();
        this.ngUnsubscribe$.complete();
    }

    deleteById(id: string) {
        const url = `${this.groupsUrl}/${id}`;
        return this.httpClient.delete(url).pipe(
            catchError((error: HttpErrorResponse) => this.handleError(error)),
            tap(() => {
                this.deleteFromCachedGroups(id);
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
        return this.httpClient
            .get<Group[]>(`${this.groupsUrl}`)
            .pipe(catchError((error: HttpErrorResponse) => this.handleError(error)));
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
        return this.httpClient.post<Group>(`${this.groupsUrl}`, groupData).pipe(
            catchError((error: HttpErrorResponse) => this.handleError(error)),
            tap(() => {
                this.updateCachedGroups(groupData);
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
