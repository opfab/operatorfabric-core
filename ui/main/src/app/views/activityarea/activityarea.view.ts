/* Copyright (c) 2023-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Utilities} from '../../utils/utilities';
import {ServerResponseStatus} from 'app/business/server/serverResponse';
import {EntitiesService} from '@ofServices/entities/EntitiesService';
import {UserSettingsService} from '@ofServices/userSettings/UserSettingsService';
import {UsersService} from '@ofServices/users/UsersService';
import {map, Observable, ReplaySubject} from 'rxjs';
import {ActivityAreaEntityCluster, ActivityAreaLine, ActivityAreaPage} from './activityareaPage';
import {RoleEnum} from '@ofServices/entities/model/RoleEnum';
import {OpfabStore} from '../../store/opfabStore';
import {Entity} from '@ofServices/entities/model/Entity';
import {ApplicationEventsService} from '@ofServices/events/ApplicationEventsService';

export class ActivityAreaView {
    private readonly activityAreaSubject = new ReplaySubject<ActivityAreaPage>(1);
    private readonly activityAreaPage: ActivityAreaPage;
    private readonly activityAreaOrphanEntitiesCluster: ActivityAreaEntityCluster;
    private readonly activityAreaClusters: Map<string, ActivityAreaEntityCluster> = new Map<
        string,
        ActivityAreaEntityCluster
    >();
    private readonly currentUserLogin;
    private intervalForConnectedUsersUpdate;
    private newActivityAreas: any = new Map<string, boolean>();

    constructor() {
        this.currentUserLogin = UsersService.getCurrentUserWithPerimeters().userData.login;
        this.activityAreaPage = new ActivityAreaPage();
        this.activityAreaClusters = new Map();
        this.activityAreaOrphanEntitiesCluster = new ActivityAreaEntityCluster(' ', []);

        UsersService.getUser(this.currentUserLogin).subscribe((user) => {
            if (user.entities) {
                const entities = EntitiesService.getEntitiesFromIds(user.entities);
                entities.sort((a, b) => Utilities.compareObj(a.name, b.name));
                entities.forEach((entity) => {
                    this.addEntityToClusters(entity);
                });
                this.activityAreaPage.activityAreaClusters = [...this.activityAreaClusters.values()];
                if (this.activityAreaOrphanEntitiesCluster.lines.length > 0) {
                    this.activityAreaPage.activityAreaClusters = this.activityAreaPage.activityAreaClusters.concat(
                        this.activityAreaOrphanEntitiesCluster
                    );
                }
                this.getConnectedUsers().subscribe((connected) => {
                    this.activityAreaSubject.next(this.activityAreaPage);
                    this.activityAreaSubject.complete();
                });
                this.updateRegularyConnectedUsers();
            }
        });
    }

    private addEntityToClusters(entity: Entity) {
        const entitiesConnected = UsersService.getCurrentUserWithPerimeters().userData.entities;
        if (entity?.roles?.includes(RoleEnum.ACTIVITY_AREA)) {
            const activityAreaLine = new ActivityAreaLine();
            activityAreaLine.entityId = entity.id;
            activityAreaLine.entityName = entity.name;
            activityAreaLine.isUserConnected = entitiesConnected?.includes(entity.id);

            if (entity.parents?.length > 0) {
                entity.parents.forEach((parentId) => {
                    const parentEntity = EntitiesService.getEntity(parentId);
                    if (parentEntity?.roles?.includes(RoleEnum.ACTIVITY_AREA_GROUP)) {
                        this.isEntityAlreadyACluster(parentEntity.name)
                            ? this.addLineToCluster(this.activityAreaClusters.get(parentEntity.name), activityAreaLine)
                            : this.activityAreaClusters.set(
                                  parentEntity.name,
                                  new ActivityAreaEntityCluster(parentEntity.name, [activityAreaLine])
                              );
                    } else {
                        this.addLineToCluster(this.activityAreaOrphanEntitiesCluster, activityAreaLine);
                    }
                });
            } else {
                this.addLineToCluster(this.activityAreaOrphanEntitiesCluster, activityAreaLine);
            }
        }
    }

    private isEntityAlreadyACluster(entityName: string): boolean {
        return this.activityAreaClusters.has(entityName);
    }

    private addLineToCluster(cluster: ActivityAreaEntityCluster, line: ActivityAreaLine): void {
        if (!cluster.lines.some((clusterLine) => clusterLine.entityId === line.entityId)) {
            cluster.lines.push(line);
        }
    }

    private getConnectedUsers(): Observable<boolean> {
        return UsersService.loadConnectedUsers().pipe(
            map((connectedUsers) => {
                this.activityAreaPage.activityAreaClusters.forEach((cluster) => {
                    cluster.lines.forEach((line) => {
                        line.connectedUsers = [];
                    });
                });
                connectedUsers.sort((obj1, obj2) => Utilities.compareObj(obj1.login, obj2.login));
                connectedUsers.forEach((connectedUser) => {
                    const entitiesConnected = connectedUser.entitiesConnected;
                    if (entitiesConnected)
                        entitiesConnected.forEach((entityId) => {
                            this.activityAreaPage.activityAreaClusters.forEach((cluster) => {
                                cluster.lines.forEach((line) => {
                                    if (line.entityId === entityId) {
                                        if (connectedUser.firstName && connectedUser.lastName) {
                                            line.connectedUsers.push(
                                                connectedUser.firstName + ' ' + connectedUser.lastName
                                            );
                                        } else {
                                            line.connectedUsers.push(connectedUser.login);
                                        }
                                    }
                                });
                            });
                        });
                });

                this.activityAreaPage.activityAreaClusters.forEach((cluster) => {
                    cluster.lines.forEach((line) => {
                        line.connectedUsersText = line.connectedUsers.join(', ');
                    });
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
        if (this.newActivityAreas.has(entityId)) {
            this.newActivityAreas.delete(entityId);
        } else {
            this.newActivityAreas.set(entityId, isConnected);
        }
    }

    private applyConnectionUpdateToPage(): void {
        for (const [entityId, isConnected] of this.newActivityAreas) {
            this.activityAreaPage.activityAreaClusters.forEach((cluster) => {
                cluster.lines.forEach((line) => {
                    if (line.entityId === entityId) {
                        line.isUserConnected = isConnected;
                    }
                });
            });
        }
    }

    public saveActivityArea(): Observable<boolean> {
        const entitiesDisconnected = new Array();
        if (this.doesActivityAreasNeedToBeSaved) {
            this.applyConnectionUpdateToPage();
            this.activityAreaPage.activityAreaClusters.forEach((cluster) => {
                cluster.lines.forEach((line) => {
                    if (!line.isUserConnected) entitiesDisconnected.push(line.entityId);
                });
            });
            this.newActivityAreas = new Map<string, boolean>();
            return UserSettingsService.patchUserSettings({
                login: this.currentUserLogin,
                entitiesDisconnected: entitiesDisconnected
            }).pipe(
                map((response) => {
                    if (response.status === ServerResponseStatus.OK) {
                        OpfabStore.getLightCardStore().removeAllLightCards();
                        UsersService.loadUserWithPerimetersData().subscribe(() => {
                            // needed to trigger change in the list of entities in the top right corner
                            ApplicationEventsService.setUserConfigChange();
                        });
                        return true;
                    } else return false;
                })
            );
        }
    }

    public getActivityAreaPage(): Observable<ActivityAreaPage> {
        return this.activityAreaSubject.asObservable();
    }

    public stopUpdateRegularyConnectedUser() {
        clearInterval(this.intervalForConnectedUsersUpdate);
    }

    public doesActivityAreasNeedToBeSaved(): boolean {
        return this.newActivityAreas.size > 0;
    }
}
