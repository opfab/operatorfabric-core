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
import {FormControl, FormGroup} from '@angular/forms';
import {UserPreferencesService} from 'app/business/services/users/user-preference.service';
import {MultiSelectConfig} from '@ofModel/multiselect.model';
import {EntitiesService} from 'app/business/services/users/entities.service';
import {ConfigServer} from 'app/business/server/config.server';
import {OpfabLoggerService} from 'app/business/services/logs/opfab-logger.service';
import {RealtimeUsersView} from 'app/business/view/realtimeusers/realtimeusers.view';
import {RealtimePage} from 'app/business/view/realtimeusers/realtimePage';

@Component({
    selector: 'of-realtimeusers',
    templateUrl: './realtimeusers.component.html',
    styleUrls: ['./realtimeusers.component.scss']
})
export class RealtimeusersComponent implements OnInit, OnDestroy {
    realTimeScreensForm: FormGroup<{
        realTimeScreen: FormControl<string | null>;
    }>;

    public multiSelectConfig: MultiSelectConfig = {
        labelKey: 'realTimeUsers.realTimeScreen',
        multiple: false,
        search: true
    };

    isPageLoaded: boolean = false;
    realtimeusersView: RealtimeUsersView;
    realtimePage: RealtimePage;
    initialScreenOption: string;

    constructor(
        private configServer: ConfigServer,
        private logger: OpfabLoggerService,
        private userService: UserService,
        private entitiesService: EntitiesService,
        private userPreferences: UserPreferencesService
    ) {}

    ngOnInit(): void {
        this.realTimeScreensForm = new FormGroup({
            realTimeScreen: new FormControl('')
        });

        this.realtimeusersView = new RealtimeUsersView(
            this.configServer,
            this.logger,
            this.userService,
            this.entitiesService
        );
        this.realtimeusersView.getPage().subscribe((realtimePage) => {
            if (realtimePage) {
                this.realtimePage = realtimePage;
                this.setInitialScreenOption();
            }
            this.isPageLoaded = true;
        });

        this.changeScreenWhenSelectScreen();
    }

    setInitialScreenOption(): void {
        const screenOptionPreference = Number(this.userPreferences.getPreference(
            'opfab.realTimeScreens.screenIndexToDisplayFirst'
        ));
        this.initialScreenOption = this.realtimePage.screenOptions[screenOptionPreference]
            ? String(screenOptionPreference)
            : '0';
        this.realtimeusersView.setSelectedScreen(this.initialScreenOption);
    }

    changeScreenWhenSelectScreen(): void {
        this.realTimeScreensForm.get('realTimeScreen').valueChanges.subscribe((optionIndex) => {
            if (optionIndex) {
                this.realtimeusersView.setSelectedScreen(optionIndex);
                this.userPreferences.setPreference(
                    'opfab.realTimeScreens.screenIndexToDisplayFirst',
                    optionIndex
                );
            }
        });
    }

    ngOnDestroy() {
        if (this.realtimePage)
            this.realtimeusersView.stopUpdate();
    }

    isEllipsisActive(id: string): boolean {
        const element = document.getElementById(id);
        return (element.offsetWidth < element.scrollWidth);
   }
}
