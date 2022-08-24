/* Copyright (c) 2021-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, OnDestroy, OnInit} from '@angular/core';
import {UserService} from '@ofServices/user.service';
import {RealTimeScreensService} from '@ofServices/real-time-screens.service';
import {RealTimeScreen} from '@ofModel/real-time-screens.model';
import {EntitiesService} from '@ofServices/entities.service';
import {GroupsService} from '@ofServices/groups.service';
import {FormControl, FormGroup} from '@angular/forms';
import {UserPreferencesService} from '@ofServices/user-preference.service';
import {Utilities} from '../../common/utilities';
import {MultiSelectConfig} from '@ofModel/multiselect.model';

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
    connectedUsersPerEntityAndGroup: Map<string, Array<string>> = new Map<string, Array<string>>();
    realTimeScreensOptions = [];
    columnsNumberPerScreenAndScreenColumn: Map<string, number> = new Map<string, number>();

    public multiSelectConfig: MultiSelectConfig = {
        labelKey: 'realTimeUsers.realTimeScreen',
        multiple: false,
        search: true
    };


    constructor(
        private userService: UserService,
        private realTimeScreensService: RealTimeScreensService,
        private entitiesService: EntitiesService,
        private groupsService: GroupsService,
        private userPreferences: UserPreferencesService
    ) {}

    ngOnInit(): void {
        this.realTimeScreensForm = new FormGroup({
            realTimeScreen: new FormControl('')
        });

        this.changeScreenWhenSelectRealTimeScreen();

        this.realTimeScreensService.loadRealTimeScreensData().subscribe((result) => {
            this.realTimeScreens = result.realTimeScreens;

            this.realTimeScreens.forEach((realTimeScreen, index) => {
                this.realTimeScreensOptions.push({value: String(index), label: realTimeScreen.screenName});
            });
            this.isRealTimeScreensLoaded = true;

            const screenIndexToDisplayFirst = this.userPreferences.getPreference(
                'opfab.realTimeScreens.screenIndexToDisplayFirst'
            );
            if (!!screenIndexToDisplayFirst) {
                this.displayRealTimeScreenIndex(Number(screenIndexToDisplayFirst));
            } else {
                this.displayRealTimeScreenIndex(0);
            }

            this.loadColumnsNumberPerScreenAndScreenColumn();
        });

        this.refresh();

        this.interval = setInterval(() => {
            this.refresh();
        }, 2000);
    }

    loadColumnsNumberPerScreenAndScreenColumn() {
        this.realTimeScreens.forEach((realTimeScreen, screenIndex) => {
            realTimeScreen.screenColumns.forEach((screenColumn, columnIndex) => {
                let biggerNumberOfColumns = 0;

                screenColumn.entitiesGroups.forEach((entityGroup) => {
                    if (entityGroup.groups.length > biggerNumberOfColumns)
                        biggerNumberOfColumns = entityGroup.groups.length;
                });

                this.columnsNumberPerScreenAndScreenColumn.set(screenIndex + '.' + columnIndex, biggerNumberOfColumns);
            });
        });
    }

    refresh() {
        this.userService.loadConnectedUsers().subscribe((connectedUsers) => {
            this.connectedUsersPerEntityAndGroup.clear();

            connectedUsers.sort((obj1, obj2) => Utilities.compareObj(obj1.login, obj2.login));

            connectedUsers.forEach((realTimeUserConnected) => {
                realTimeUserConnected.entitiesConnected.forEach((entityConnected) => {
                    realTimeUserConnected.groups.forEach((group) => {
                        let usersConnectedPerEntityAndGroup = this.connectedUsersPerEntityAndGroup.get(
                            entityConnected + '.' + group
                        );

                        if (!usersConnectedPerEntityAndGroup) usersConnectedPerEntityAndGroup = [];

                        // we don't want duplicates for the same user
                        if (!usersConnectedPerEntityAndGroup.includes(realTimeUserConnected.login))
                            usersConnectedPerEntityAndGroup.push(realTimeUserConnected.login);
                        this.connectedUsersPerEntityAndGroup.set(
                            entityConnected + '.' + group,
                            usersConnectedPerEntityAndGroup
                        );
                    });
                });
            });
        });
    }

    displayRealTimeScreenIndex(index: number): void {
        this.realTimeScreenIndexToDisplay = !!this.realTimeScreens[index] ? String(index) : '0';
        this.realTimeScreensForm.get('realTimeScreen').setValue(this.realTimeScreenIndexToDisplay);
    }

    changeScreenWhenSelectRealTimeScreen(): void {
        this.realTimeScreensForm.get('realTimeScreen').valueChanges.subscribe((realTimeScreenIndex) => {
            if (!!realTimeScreenIndex) {
                this.realTimeScreenIndexToDisplay = realTimeScreenIndex;
                this.userPreferences.setPreference(
                    'opfab.realTimeScreens.screenIndexToDisplayFirst',
                    String(realTimeScreenIndex)
                );
            }
        });
    }

    getLabelForConnectedUsers(entityAndGroup: string): string {
        let label = '';
        const connectedUsers = this.connectedUsersPerEntityAndGroup.get(entityAndGroup);
        connectedUsers.forEach(login => {
            label += login + ' ';
        });
        return label.trim();
    }

    getNumberOfConnectedUsersInEntityAndGroup(entityAndGroup: string): number {
        const connectedUsers = this.connectedUsersPerEntityAndGroup.get(entityAndGroup);
        if (!!connectedUsers) return connectedUsers.length;
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
