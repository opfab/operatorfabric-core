/* Copyright (c) 2021-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, OnDestroy, OnInit} from '@angular/core';
import {UserService} from 'app/business/services/users/user.service';
import {RealTimeScreen} from '@ofModel/real-time-screens.model';
import {FormControl, FormGroup} from '@angular/forms';
import {UserPreferencesService} from 'app/business/services/users/user-preference.service';
import {Utilities} from '../../business/common/utilities';
import {MultiSelectConfig} from '@ofModel/multiselect.model';
import {EntitiesService} from 'app/business/services/users/entities.service';
import {GroupsService} from 'app/business/services/users/groups.service';
import {ConfigServer} from 'app/business/server/config.server';
import {ServerResponseStatus} from 'app/business/server/serverResponse';
import {OpfabLoggerService} from 'app/business/services/logs/opfab-logger.service';

@Component({
    selector: 'of-realtimeusers',
    templateUrl: './realtimeusers.component.html',
    styleUrls: ['./realtimeusers.component.scss']
})
export class RealtimeusersComponent implements OnInit, OnDestroy {
    realTimeScreensForm: FormGroup<{
        realTimeScreen: FormControl<string | null>;
    }>;
    interval;

    realTimeScreens: Array<RealTimeScreen>;
    isRealTimeScreensLoaded = false;
    realTimeScreenIndexToDisplay: string;
    connectedUsersPerEntity: Map<string, Array<string>> = new Map<string, Array<string>>();
    realTimeScreensOptions = [];

    public multiSelectConfig: MultiSelectConfig = {
        labelKey: 'realTimeUsers.realTimeScreen',
        multiple: false,
        search: true
    };


    constructor(
        private userService: UserService,
        private userPreferences: UserPreferencesService,
        private entitiesService: EntitiesService,
        private groupsService: GroupsService,
        private configServer: ConfigServer,
        private logger: OpfabLoggerService
    ) {}

    ngOnInit(): void {
        this.realTimeScreensForm = new FormGroup({
            realTimeScreen: new FormControl('')
        });

        this.changeScreenWhenSelectRealTimeScreen();

        this.configServer.getRealTimeScreenConfiguration().subscribe((result) => {

            if (result.status === ServerResponseStatus.OK) {
                this.logger.info('List of realTimeScreens loaded');

                this.realTimeScreens = result.data.realTimeScreens;

                this.realTimeScreens.forEach((realTimeScreen, index) => {
                    this.realTimeScreensOptions.push({value: String(index), label: realTimeScreen.screenName});
                });
                this.isRealTimeScreensLoaded = true;

                const screenIndexToDisplayFirst = this.userPreferences.getPreference(
                    'opfab.realTimeScreens.screenIndexToDisplayFirst'
                );
                if (screenIndexToDisplayFirst) {
                    this.displayRealTimeScreenIndex(Number(screenIndexToDisplayFirst));
                } else {
                    this.displayRealTimeScreenIndex(0);
                }
            } else {
                this.logger.error('The real time screen could not be loaded');
            }
        });

        this.refresh();

        this.interval = setInterval(() => {
            this.refresh();
        }, 2000);
    }

    refresh() {
        this.userService.loadConnectedUsers().subscribe((connectedUsers) => {
            this.connectedUsersPerEntity.clear();

            connectedUsers.sort((obj1, obj2) => Utilities.compareObj(obj1.login, obj2.login));

            connectedUsers.forEach((realTimeUserConnected) => {
                if (realTimeUserConnected.entitiesConnected) {
                    realTimeUserConnected.entitiesConnected.forEach((entityConnected) => {
                        let usersConnectedPerEntity = this.connectedUsersPerEntity.get(
                            entityConnected
                        );

                        if (!usersConnectedPerEntity) {
                            usersConnectedPerEntity = [];
                        }

                        // we don't want duplicates for the same user
                        if (!usersConnectedPerEntity.includes(realTimeUserConnected.login))
                            usersConnectedPerEntity.push(realTimeUserConnected.login);
                        this.connectedUsersPerEntity.set(
                            entityConnected,
                            usersConnectedPerEntity
                        );
                    });
                }
            });
        });
    }

    displayRealTimeScreenIndex(index: number): void {
        this.realTimeScreenIndexToDisplay = this.realTimeScreens[index] ? String(index) : '0';
        this.realTimeScreensForm.get('realTimeScreen').setValue(this.realTimeScreenIndexToDisplay);
    }

    changeScreenWhenSelectRealTimeScreen(): void {
        this.realTimeScreensForm.get('realTimeScreen').valueChanges.subscribe((realTimeScreenIndex) => {
            if (realTimeScreenIndex) {
                this.realTimeScreenIndexToDisplay = realTimeScreenIndex;
                this.userPreferences.setPreference(
                    'opfab.realTimeScreens.screenIndexToDisplayFirst',
                    String(realTimeScreenIndex)
                );
            }
        });
    }

    getLabelForConnectedUsers(entity: string): string {
        let label = '';
        const connectedUsers = this.connectedUsersPerEntity.get(entity);
        connectedUsers.forEach(login => {
            label += login + ', ';
        });
        return label.slice(0, -2);
    }

    getNumberOfConnectedUsersInEntity(entity: string): number {
        const connectedUsers = this.connectedUsersPerEntity.get(entity);
        if (connectedUsers) return connectedUsers.length;
        return 0;
    }

    ngOnDestroy() {
        clearInterval(this.interval);
    }

    isEllipsisActive(id: string): boolean {
        const element = document.getElementById(id);
        return (element.offsetWidth < element.scrollWidth);
   }
}
