/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Utilities} from 'app/business/common/utilities';
import {ServerResponseStatus} from 'app/business/server/serverResponse';
import {EntitiesService} from 'app/business/services/users/entities.service';
import {SettingsService} from 'app/business/services/users/settings.service';
import {UserService} from 'app/business/services/users/user.service';
import {map, Observable, ReplaySubject} from 'rxjs';
import {ActivityAreaLine, ActivityAreaPage} from './activityareaPage';
import {OpfabStore} from 'app/business/store/opfabStore';

export class ActivityAreaView {
    private activityAreaSubject = new ReplaySubject<ActivityAreaPage>(1);
    private activityAreaPage: ActivityAreaPage;
    private currentUserLogin;
    private intervalForConnectedUsersUpdate;

    constructor(
    ) {
        this.currentUserLogin = UserService.getCurrentUserWithPerimeters().userData.login;
        this.activityAreaPage = new ActivityAreaPage();

        UserService.getUser(this.currentUserLogin).subscribe((user) => {
            if (user.entities) {
                const entitiesConnected = UserService.getCurrentUserWithPerimeters().userData.entities;
                const entities = EntitiesService.getEntitiesFromIds(user.entities);
                entities.sort((a, b) => Utilities.compareObj(a.name, b.name));
                entities.forEach((entity) => {
                    if (entity?.entityAllowedToSendCard) {
                        const activityAreaLine = new ActivityAreaLine();
                        activityAreaLine.entityId = entity.id;
                        activityAreaLine.entityName = entity.name;
                        activityAreaLine.isUserConnected = entitiesConnected?.includes(entity.id);
                        this.activityAreaPage.lines.push(activityAreaLine);
                    }
                });
                this.getConnectedUsers().subscribe((connected) => {
                    this.activityAreaSubject.next(this.activityAreaPage);
                    this.activityAreaSubject.complete();
                });
                this.updateRegularyConnectedUsers();
            }
        });
    }

    private getConnectedUsers(): Observable<boolean> {
        return UserService.loadConnectedUsers().pipe(
            map((connectedUsers) => {
                this.activityAreaPage.lines.forEach((line) => (line.connectedUsers = []));
                connectedUsers.sort((obj1, obj2) => Utilities.compareObj(obj1.login, obj2.login));
                connectedUsers.forEach((connectedUser) => {
                    if (connectedUser.login === this.currentUserLogin) return;
                    const entitiesConnected = connectedUser.entitiesConnected;
                    if (entitiesConnected)
                        entitiesConnected.forEach((entityId) => {
                            this.activityAreaPage.lines.forEach((line) => {
                                if (line.entityId === entityId) {
                                    line.connectedUsers.push(connectedUser.login);
                                }
                            });
                        });
                });
                this.activityAreaPage.lines.forEach((line) => {
                    line.connectedUsersText = line.connectedUsers.join(', ');
                });
                return true;
            })
        );
    }

    private updateRegularyConnectedUsers() {
        this.intervalForConnectedUsersUpdate = setInterval(() => {
            this.getConnectedUsers().subscribe();
        }, 2000);
    }

    public setEntityConnected(entityId: string, isConnected: boolean) {
        this.activityAreaPage.lines.forEach((line) => {
            if (line.entityId === entityId) {
                line.isUserConnected = isConnected;
            }
        });
    }

    public saveActivityArea(): Observable<boolean> {
        const entitiesDisconnected = new Array();
        this.activityAreaPage.lines.forEach((line) => {
            if (line.isUserConnected) return;
            entitiesDisconnected.push(line.entityId);
        });
        return SettingsService
            .patchUserSettings({login: this.currentUserLogin, entitiesDisconnected: entitiesDisconnected})
            .pipe(
                map((response) => {
                    if (response.status === ServerResponseStatus.OK) {
                        OpfabStore.getLightCardStore().removeAllLightCards();
                        UserService.loadUserWithPerimetersData().subscribe();
                        return true;
                    } else return false;
                })
            );
    }

    public getActivityAreaPage(): Observable<ActivityAreaPage> {
        return this.activityAreaSubject.asObservable();
    }

    public stopUpdateRegularyConnectedUser() {
        clearInterval(this.intervalForConnectedUsersUpdate);
    }
}
