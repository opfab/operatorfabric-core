/* Copyright (c) 2022-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, OnInit, Output, ViewChild} from '@angular/core';
import {LogLevel, LoggerService, LoggerService as logger} from 'app/services/logs/LoggerService';
import {firstValueFrom, Subject, tap} from 'rxjs';
import {ActivityAreaChoiceAfterLoginComponent} from './activityarea-choice-after-login/activityarea-choice-after-login.component';
import {AppLoadedInAnotherTabComponent} from './app-loaded-in-another-tab/app-loaded-in-another-tab.component';
import {OpfabEventStreamServer} from 'app/business/server/opfabEventStream.server';
import {CurrentUserStore} from 'app/business/store/current-user.store';
import {AuthService} from 'app/authentication/auth.service';
import {AuthenticationMode} from 'app/authentication/auth.model';
import {RemoteLoggerServer} from '@ofServices/logs/server/RemoteLoggerServer';
import {ConfigServer} from '@ofServices/config/server/ConfigServer';
import {ApplicationLoader} from 'app/business/application-loader';
import {TranslationLib} from '@ofServices/translation/lib/TranslationLib';
import {UserServer} from 'app/business/server/user.server';
import {AngularRouterService} from '@ofServices/angularRouterService';
import {EntitiesServer} from '@ofServices/entities/server/EntitiesServer';
import {GroupsServer} from '@ofServices/groups/server/GroupsServer';
import {PerimetersServer} from 'app/business/server/perimeters.server';
import {ProcessesServer} from '@ofServices/processes/server/ProcessesServer';
import {AcknowledgeServer} from '@ofServices/acknowlegment/server/AcknowledgeServer';
import {AdminProcessesServer} from '@ofServices/admin/server/AdminProcessesServer';
import {BusinessDataServer} from '@ofServices/businessdata/server/BusinessDataServer';
import {CardServer} from 'app/business/server/card.server';
import {SupervisedEntitiesServer} from '@ofServices/admin/server/SupervisedEntitiesServer';
import {ExternalDevicesServer} from '@ofServices/notifications/server/ExternalDevicesServer';
import {TemplateCssServer} from '../../../business/server/template-css.server';
import {SettingsServer} from '../../../business/server/settings.server';
import {ModalServer} from 'app/business/server/modal.server';
import {SoundServer} from '@ofServices/notifications/server/SoundServer';
import {NgIf} from '@angular/common';
import {LoadingInProgressComponent} from './loading-in-progress/loading-in-progress.component';
import {LoginComponent} from './login/login.component';
import {TranslateModule} from '@ngx-translate/core';
import {loadBuiltInTemplates} from 'app/builtInTemplates/templatesLoader';
import {HandlebarsTemplateServer} from '@ofServices/handlebars/server/HandlebarsTemplateServer';

@Component({
    selector: 'of-application-loading',
    styleUrls: ['./application-loading.component.scss'],
    templateUrl: './application-loading.component.html',
    standalone: true,
    imports: [
        NgIf,
        LoadingInProgressComponent,
        AppLoadedInAnotherTabComponent,
        LoginComponent,
        ActivityAreaChoiceAfterLoginComponent,
        TranslateModule
    ]
})
export class ApplicationLoadingComponent implements OnInit {
    @Output() applicationLoadedDone: Subject<boolean> = new Subject();

    @ViewChild('activityAreaChoiceAfterLogin')
    activityAreaChoiceAfterLoginComponent: ActivityAreaChoiceAfterLoginComponent;
    @ViewChild('appLoadedInAnotherTab') appLoadedInAnotherTabComponent: AppLoadedInAnotherTabComponent;

    public applicationLoaded = false;
    public applicationLoader: ApplicationLoader;
    public showLoginScreen = false;

    constructor(
        private readonly authService: AuthService,
        private readonly configServer: ConfigServer,
        private readonly opfabEventStreamServer: OpfabEventStreamServer,
        private readonly translationLib: TranslationLib,
        private readonly remoteLoggerServer: RemoteLoggerServer,
        private readonly userServer: UserServer,
        private readonly routerService: AngularRouterService,
        private readonly entitiesServer: EntitiesServer,
        private readonly groupsServer: GroupsServer,
        private readonly perimetersServer: PerimetersServer,
        private readonly processesServer: ProcessesServer,
        private readonly adminProcessesServer: AdminProcessesServer,
        private readonly acknowledgeServer: AcknowledgeServer,
        private readonly businessDataServer: BusinessDataServer,
        private readonly cardServer: CardServer,
        private readonly supervisedEntitiesServer: SupervisedEntitiesServer,
        private readonly externalDevicesServer: ExternalDevicesServer,
        private readonly templateCssServer: TemplateCssServer,
        private readonly handlebarsTemplateServer: HandlebarsTemplateServer,
        private readonly settingsServer: SettingsServer,
        private readonly modalServer: ModalServer,
        private readonly soundServer: SoundServer
    ) {
        LoggerService.setLogLevel(LogLevel.DEBUG);
    }

    ngOnInit() {
        this.applicationLoader = new ApplicationLoader();
        this.applicationLoader.setServers({
            configServer: this.configServer,
            remoteLoggerServer: this.remoteLoggerServer,
            translationLib: this.translationLib,
            userServer: this.userServer,
            routerService: this.routerService,
            entitiesServer: this.entitiesServer,
            groupsServer: this.groupsServer,
            perimetersServer: this.perimetersServer,
            processesServer: this.processesServer,
            opfabEventStreamServer: this.opfabEventStreamServer,
            adminProcessesServer: this.adminProcessesServer,
            acknowledgeServer: this.acknowledgeServer,
            businessDataServer: this.businessDataServer,
            cardServer: this.cardServer,
            supervisedEntitiesServer: this.supervisedEntitiesServer,
            externalDevicesServer: this.externalDevicesServer,
            templateCssServer: this.templateCssServer,
            handlebarsTemplateServer: this.handlebarsTemplateServer,
            settingsServer: this.settingsServer,
            modalServer: this.modalServer,
            authService: this.authService,
            soundServer: this.soundServer
        });
        setTimeout(() => this.loadApplication(), 0);
    }
    private async loadApplication(): Promise<void> {
        try {
            this.applicationLoader.setAppLoadedInAnotherTabComponent(this.appLoadedInAnotherTabComponent);
            this.applicationLoader.setActivityAreaChoiceAfterLoginComponent(this.activityAreaChoiceAfterLoginComponent);
            this.applicationLoader.setMethodToAuthenticate(this.authenticate.bind(this));
            loadBuiltInTemplates();
            const success = await this.applicationLoader.startOpfab();
            if (success) {
                this.applicationLoadedDone.next(true);
                this.applicationLoadedDone.complete();
                this.applicationLoaded = true;
            }
        } catch (err) {
            this.applicationLoader.loadingInProgress = false;
            logger.error('Impossible to load application', err);
        }
    }

    private authenticate(): Promise<string> {
        logger.info(`Launch authentication process`);
        this.authService.initializeAuthentication();
        if (this.authService.getAuthMode() === AuthenticationMode.PASSWORD)
            this.waitForEmptyTokenInStorageToShowLoginForm();
        return this.waitForEndOfAuthentication();
    }

    // HACK
    //
    // In password mode when the token is not anymore in the storage
    // it means we need to show the login form
    //
    // It is needed to wait because when the token in the storage is not anymore valid
    // it will not instantly be deleted form the storage
    //
    // To have a cleaner code , we need to refactor the code
    // regarding authentication
    private waitForEmptyTokenInStorageToShowLoginForm() {
        if (!window.localStorage.getItem('token')) {
            this.showLoginScreen = true;
        } else if (!this.applicationLoaded) {
            setTimeout(() => this.waitForEmptyTokenInStorageToShowLoginForm(), 100);
        }
    }

    private async waitForEndOfAuthentication(): Promise<string> {
        return firstValueFrom(CurrentUserStore.getCurrentUserLogin().pipe(tap(() => (this.showLoginScreen = false))));
    }
}
