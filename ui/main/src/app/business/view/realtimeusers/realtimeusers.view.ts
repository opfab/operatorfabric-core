/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {ConfigServer} from "app/business/server/config.server";
import {ServerResponseStatus} from "app/business/server/serverResponse";
import {OpfabLoggerService} from "app/business/services/logs/opfab-logger.service";
import {EntitiesService} from "app/business/services/users/entities.service";
import {UserService} from "app/business/services/users/user.service";
import {Observable, ReplaySubject} from "rxjs";
import {RealtimePage,
        RealtimePageScreenOption,
        RealtimePageScreen,
        RealtimePageScreenColumn,
        RealtimePageEntityGroup,
        RealtimePageLine} from "./realtimePage";

export class RealtimeUsersView {

    private realtimePage: RealtimePage;
    private realtimeScreens: RealtimePageScreen[] = [];
    private connectedUsersPerEntity: Map<string, string[]> = new Map<string, string[]>();
    private connectedUsersGroups: Map<string, string[]> = new Map<string, string[]>();
    private pageLoaded = new ReplaySubject<RealtimePage>(1);
    private updateInterval;

    constructor(private configServer: ConfigServer,
                private logger: OpfabLoggerService,
                private userService: UserService,
                private entitiesService: EntitiesService,
    ) {
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
                        configColumn.entitiesGroups.forEach((configEntityGroup) => {

                            // entitiesGroups
                            const entityGroup = new RealtimePageEntityGroup();
                            entityGroup.name = configEntityGroup.name;
                            configEntityGroup.entities.forEach((configEntity) => {

                                // lines
                                const line = new RealtimePageLine();
                                line.entityId = configEntity;
                                line.entityName = this.entitiesService.getEntityName(configEntity);
                                line.connectedUsersCount = 0;
                                line.connectedUsers = '';
                                entityGroup.lines.push(line);
                            });
                            screenColumn.entitiesGroups.push(entityGroup);
                        });
                        screen.columns.push(screenColumn);
                    });
                    this.realtimeScreens.push(screen);
                });
                this.logger.info('realTimeScreens config loaded');
                this.updateConnectedUsers();
                this.startUpdate(2000);
            } else {
                this.logger.error('realTimeScreens config could not be loaded');
            }
            this.pageLoaded.next(this.realtimePage);
            this.pageLoaded.complete();
        });
    }

    private updateConnectedUsers() {
        this.userService.loadConnectedUsers().subscribe((connectedUsers) => {
            this.connectedUsersPerEntity.clear();

            connectedUsers.forEach((connectedUser) => {
                if (connectedUser.entitiesConnected) {
                    this.connectedUsersGroups.set(
                        connectedUser.login,
                        connectedUser.groups ?? []
                    );
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
                column.entitiesGroups.forEach((entityGroup) => {
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
        if (displayedGroups.length === 0 || usersUnfiltered.length === 0)
            return usersUnfiltered;

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
