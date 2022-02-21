/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * Copyright (c) 2020, RTEi (http://www.rte-international.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {ModuleWithProviders, NgModule, Optional, SkipSelf} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {AuthenticationService} from './authentication/authentication.service';
import {TokenInjector} from './interceptors.service';
import {CardService} from './card.service';
import {GuidService} from '@ofServices/guid.service';
import {TimeService} from '@ofServices/time.service';
import {ProcessesService} from '@ofServices/processes.service';
import {ConfigService} from '@ofServices/config.service';
import {I18nService} from '@ofServices/i18n.service';
import {SettingsService} from '@ofServices/settings.service';
import {UserService} from './user.service';
import {SoundNotificationService} from '@ofServices/sound-notification.service';
import {GlobalStyleService} from '@ofServices/global-style.service';
import {AppService} from './app.service';
import {GroupsService} from './groups.service';
import {EntitiesService} from './entities.service';
import {ReminderService} from '@ofServices/reminder/reminder.service';
import {LightCardsFeedFilterService} from '@ofServices/lightcards/lightcards-feed-filter.service';
import {LightCardsStoreService} from './lightcards/lightcards-store.service';
import {SortService} from './lightcards/sort.service';
import {RemoteLoggerService} from './logs/remote-logger.service';
import {OpfabLoggerService} from './logs/opfab-logger.service';

@NgModule({
    imports: [
        CommonModule
    ],
    providers: [
        ConfigService,
        SettingsService,
        CardService,
        AuthenticationService,
        TimeService,
        ProcessesService,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: TokenInjector,
            multi: true
        }   ,
        GuidService,
        I18nService,
        UserService,
        GroupsService,
        EntitiesService,
        SoundNotificationService,
        GlobalStyleService,
        AppService,
        ReminderService,
        LightCardsFeedFilterService,
        LightCardsStoreService,
        SortService,
        OpfabLoggerService,
        RemoteLoggerService,
    ]
})
export class ServicesModule {
    static forRoot(): ModuleWithProviders<ServicesModule> {
        return {
            ngModule: ServicesModule
        };
    }

    constructor(
        @Optional()
        @SkipSelf()
            parentModule: ServicesModule
    ) {
        if (parentModule) {
            throw new Error(
                'ServicesModule is already loaded. Import it in the AppModule only'
            );
        }
    }
}

