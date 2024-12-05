/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {ConfigServer} from 'app/business/server/config.server';
import {ServerResponseStatus} from 'app/business/server/serverResponse';
import {LoggerService as logger} from 'app/business/services/logs/logger.service';
import {EntitiesService} from 'app/business/services/users/entities.service';
import {UserService} from 'app/business/services/users/user.service';
import {Observable, ReplaySubject} from 'rxjs';
import {
    RealtimePage,
    RealtimePageScreenOption,
    RealtimePageScreen,
    RealtimePageScreenColumn,
    RealtimePageEntityGroup,
    RealtimePageLine
} from './realtimePage';
import {Utilities} from 'app/business/common/utilities';

export class RealtimeUsersView {
    private realtimePage: RealtimePage;
    private readonly realtimeScreens: RealtimePageScreen[] = [];
    private readonly connectedUsersPerEntity: Map<string, string[]> = new Map<string, string[]>();
    private readonly connectedUsersGroups: Map<string, string[]> = new Map<string, string[]>();
    private readonly pageLoaded = new ReplaySubject<RealtimePage>(1);
    private updateInterval;

    constructor(private readonly configServer: ConfigServer) {
        this.init();
    }

    private init() {
        this.configServer.getRealTimeScreenConfiguration().subscribe((result) => {
            if (result.status === ServerResponseStatus.OK && result.data.realTimeScreens.length > 0) {
                this.realtimePage = new RealtimePage();

                const config = result.data.realTimeScreens;
                config.forEach((configScreen, index) => {
                    // options
                    const screenOption = new RealtimePageScreenOption();
                    screenOption.value = String(index);
                    screenOption.label = configScreen.screenName;
                    this.realtimePage.screenOptions.push(screenOption);

                    // screens
                    const screen = new RealtimePageScreen();
                    screen.name = configScreen.screenName;
                    screen.onlyDisplayUsersInGroups = configScreen.onlyDisplayUsersInGroups ?? [];
                    configScreen.screenColumns.forEach((configColumn) => {
                        // columns
                        const screenColumn = new RealtimePageScreenColumn();
                        configColumn.entitiesGroups.forEach((configEntityGroupId) => {
                            // entitiesGroups
                            const entityGroup = new RealtimePageEntityGroup();
                            entityGroup.name = EntitiesService.getEntityName(configEntityGroupId).toUpperCase();
                            EntitiesService.resolveChildEntities(configEntityGroupId).forEach((childEntity) => {
                                // lines
                                const line = new RealtimePageLine();
                                line.entityId = childEntity.id;
                                line.entityName = childEntity.name;
                                line.connectedUsersCount = 0;
                                line.connectedUsers = '';
                                entityGroup.lines.push(line);
                            });
                            entityGroup.lines.sort((a, b) => Utilities.compareObj(a.entityName, b.entityName));
                            screenColumn.entityPages.push(entityGroup);
                        });
                        screen.columns.push(screenColumn);
                    });
                    this.realtimeScreens.push(screen);
                });
                logger.info('realTimeScreens config loaded');
                this.updateConnectedUsers();
                this.startUpdate(2000);
            } else {
                logger.error('realTimeScreens config could not be loaded');
            }
            this.pageLoaded.next(this.realtimePage);
            this.pageLoaded.complete();
        });
    }

    private updateConnectedUsers() {
        UserService.loadConnectedUsers().subscribe((connectedUsers) => {
            this.connectedUsersPerEntity.clear();

            connectedUsers.forEach((connectedUser) => {
                if (connectedUser.entitiesConnected) {
                    this.connectedUsersGroups.set(connectedUser.login, connectedUser.groups ?? []);
                    connectedUser.entitiesConnected.forEach((entityConnected) => {
                        const connectedUsersToEntity = this.connectedUsersPerEntity.get(entityConnected) ?? [];

                        if (!connectedUsersToEntity.includes(connectedUser.login)) {
                            connectedUsersToEntity.push(connectedUser.login);
                            this.connectedUsersPerEntity.set(entityConnected, connectedUsersToEntity);
                        }
                    });
                }
            });
            this.computeLinesInformations();
        });
    }

    private computeLinesInformations() {
        this.realtimeScreens.forEach((screen) => {
            screen.columns.forEach((column) => {
                column.entityPages.forEach((entityGroup) => {
                    entityGroup.lines.forEach((line) => {
                        const connectedUsers = this.getUsersInDisplayedGroups(
                            line.entityId,
                            screen.onlyDisplayUsersInGroups
                        );
                        line.connectedUsersCount = connectedUsers.length;
                        line.connectedUsers = connectedUsers.join(', ');
                    });
                });
            });
        });
    }

    private getUsersInDisplayedGroups(entity: string, displayedGroups: string[]): string[] {
        const usersFiltered = [];

        const usersUnfiltered = this.connectedUsersPerEntity.get(entity) ?? [];
        if (displayedGroups.length === 0 || usersUnfiltered.length === 0) return usersUnfiltered;

        usersUnfiltered.forEach((userUnfiltered) => {
            const userGroups = this.connectedUsersGroups.get(userUnfiltered);
            for (const userGroup of userGroups) {
                if (displayedGroups.includes(userGroup)) {
                    usersFiltered.push(userUnfiltered);
                    break;
                }
            }
        });
        return usersFiltered;
    }

    private startUpdate(delay: number) {
        this.updateInterval = setInterval(() => {
            this.updateConnectedUsers();
        }, delay);
    }

    public stopUpdate() {
        clearInterval(this.updateInterval);
    }

    public getPage(): Observable<RealtimePage> {
        return this.pageLoaded.asObservable();
    }

    public setSelectedScreen(index: string) {
        this.realtimePage.currentScreen = this.realtimeScreens[index];
    }
}
