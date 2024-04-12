/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
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
import {ActivityAreaEntityCluster, ActivityAreaLine, ActivityAreaPage} from './activityareaPage';
import {RolesEnum} from '@ofModel/roles.model';
import {OpfabStore} from 'app/business/store/opfabStore';
import {Entity} from '@ofModel/entity.model';
import {ApplicationEventsService} from 'app/business/services/events/application-events.service';

export class ActivityAreaView {
    private activityAreaSubject = new ReplaySubject<ActivityAreaPage>(1);
    private activityAreaPage: ActivityAreaPage;
    private activityAreaOrphanEntitiesCluster: ActivityAreaEntityCluster;
    private activityAreaClusters: Map<string, ActivityAreaEntityCluster> = new Map<string, ActivityAreaEntityCluster>();
    private currentUserLogin;
    private intervalForConnectedUsersUpdate;

    constructor() {
        this.currentUserLogin = UserService.getCurrentUserWithPerimeters().userData.login;
        this.activityAreaPage = new ActivityAreaPage();
        this.activityAreaClusters = new Map();
        this.activityAreaOrphanEntitiesCluster = new ActivityAreaEntityCluster(' ', []);

        UserService.getUser(this.currentUserLogin).subscribe((user) => {
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
        const entitiesConnected = UserService.getCurrentUserWithPerimeters().userData.entities;
        if (entity?.roles?.includes(RolesEnum.ACTIVITY_AREA)) {
            const activityAreaLine = new ActivityAreaLine();
            activityAreaLine.entityId = entity.id;
            activityAreaLine.entityName = entity.name;
            activityAreaLine.isUserConnected = entitiesConnected?.includes(entity.id);

            if (entity.parents?.length > 0) {
                entity.parents.forEach((parentId) => {
                    const parentEntity = EntitiesService.getEntity(parentId);
                    if (parentEntity?.roles && parentEntity.roles.includes(RolesEnum.ACTIVITY_AREA_GROUP)) {
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
        return UserService.loadConnectedUsers().pipe(
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
                                        line.connectedUsers.push(connectedUser.login);
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
        this.activityAreaPage.activityAreaClusters.forEach((cluster) => {
            cluster.lines.forEach((line) => {
                if (line.entityId === entityId) {
                    line.isUserConnected = isConnected;
                }
            });
        });
    }

    public saveActivityArea(): Observable<boolean> {
        const entitiesDisconnected = new Array();
        this.activityAreaPage.activityAreaClusters.forEach((cluster) => {
            cluster.lines.forEach((line) => {
                if (line.isUserConnected) return;
                entitiesDisconnected.push(line.entityId);
            });
        });
        return SettingsService.patchUserSettings({
            login: this.currentUserLogin,
            entitiesDisconnected: entitiesDisconnected
        }).pipe(
            map((response) => {
                if (response.status === ServerResponseStatus.OK) {
                    OpfabStore.getLightCardStore().removeAllLightCards();
                    UserService.loadUserWithPerimetersData().subscribe(() => {
                        // needed to trigger change in the list of entities on the top right corner
                        ApplicationEventsService.setUserConfigChange();
                    });
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
