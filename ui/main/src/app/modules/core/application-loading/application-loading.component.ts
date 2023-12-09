/* Copyright (c) 2022-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, OnInit, Output, ViewChild} from '@angular/core';
import {ConfigService} from 'app/business/services/config.service';
import {GroupsService} from 'app/business/services/users/groups.service';
import {LoggerService as logger} from 'app/business/services/logs/logger.service';
import {ProcessesService} from 'app/business/services/businessconfig/processes.service';
import {UserService} from 'app/business/services/users/user.service';
import {Utilities} from 'app/business/common/utilities';
import {catchError, Subject} from 'rxjs';
import {ActivityAreaChoiceAfterLoginComponent} from './activityarea-choice-after-login/activityarea-choice-after-login.component';
import {AccountAlreadyUsedComponent} from './account-already-used/account-already-used.component';
import {AppLoadedInAnotherTabComponent} from './app-loaded-in-another-tab/app-loaded-in-another-tab.component';
import {SettingsService} from 'app/business/services/users/settings.service';
import {OpfabEventStreamServer} from 'app/business/server/opfabEventStream.server';
import {OpfabEventStreamService} from 'app/business/services/events/opfabEventStream.service';
import {LightCardsStoreService} from 'app/business/services/lightcards/lightcards-store.service';
import {ApplicationUpdateService} from 'app/business/services/events/application-update.service';
import {ServerResponseStatus} from 'app/business/server/serverResponse';
import {CurrentUserStore} from 'app/business/store/current-user.store';
import {AuthService} from 'app/authentication/auth.service';
import {AuthenticationMode} from 'app/authentication/auth.model';
import {SystemNotificationService} from '../../../business/services/notifications/system-notification.service';
import {OpfabAPIService} from 'app/business/services/opfabAPI.service';
import {RemoteLoggerServer} from 'app/business/server/remote-logger.server';
import {ConfigServer} from 'app/business/server/config.server';
import {ServicesConfig} from 'app/business/services/services-config';
import {TranslationService} from 'app/business/services/translation/translation.service';
import {UserServer} from 'app/business/server/user.server';
import {AngularRouterService} from '@ofServices/angularRouterService';
import {GlobalStyleService} from 'app/business/services/global-style.service';
import {EntitiesServer} from 'app/business/server/entities.server';
import {EntitiesService} from 'app/business/services/users/entities.service';
import {GroupsServer} from 'app/business/server/groups.server';
import {PerimetersServer} from 'app/business/server/perimeters.server';
import {ProcessServer} from 'app/business/server/process.server';
import {AcknowledgeServer} from 'app/business/server/acknowledge.server';
import {AdminProcessServer} from 'app/business/server/adminprocess.server';
import {BusinessDataServer} from 'app/business/server/businessData.server';
import {CardServer} from 'app/business/server/card.server';
import {SupervisedEntitiesServer} from 'app/business/server/supervised-entities.server';
import {ExternalDevicesServer} from 'app/business/server/external-devices.server';

declare const opfab: any;
@Component({
    selector: 'of-application-loading',
    styleUrls: ['./application-loading.component.scss'],
    templateUrl: './application-loading.component.html'
})
export class ApplicationLoadingComponent implements OnInit {
    @Output() applicationLoadedDone: Subject<boolean> = new Subject();

    @ViewChild('activityAreaChoiceAfterLogin')
    activityAreaChoiceAfterLoginComponent: ActivityAreaChoiceAfterLoginComponent;
    @ViewChild('accountAlreadyUsed') accountAlreadyUsedComponent: AccountAlreadyUsedComponent;
    @ViewChild('appLoadedInAnotherTab') appLoadedInAnotherTabComponent: AppLoadedInAnotherTabComponent;

    public isDisconnected = false;
    public userLogin: string;
    public showLoginScreen = false;
    public loadingInProgress = true;
    public applicationLoaded = false;
    displayEnvironmentName = false;
    environmentName: string;
    environmentColor: string;

    constructor(
        private authService: AuthService,
        private configServer: ConfigServer,
        private settingsService: SettingsService,
        private lightCardsStoreService: LightCardsStoreService,
        private opfabEventStreamServer: OpfabEventStreamServer,
        private applicationUpdateService: ApplicationUpdateService,
        private systemNotificationService: SystemNotificationService,
        private opfabAPIService: OpfabAPIService,
        private translationService: TranslationService,
        private remoteLoggerServer: RemoteLoggerServer,
        private userServer: UserServer,
        private routerService: AngularRouterService,
        private entitiesServer: EntitiesServer,
        private groupsServer: GroupsServer,
        private perimetersServer: PerimetersServer,
        private processServer: ProcessServer,
        private adminProcessServer: AdminProcessServer,
        private acknowledgeServer: AcknowledgeServer,
        private businessDataServer: BusinessDataServer,
        private cardServer: CardServer,
        private supervisedEntitiesServer: SupervisedEntitiesServer,
        private externalDevicesServer: ExternalDevicesServer
    ) {}

    ngOnInit() {
        ServicesConfig.setServers({
            configServer: this.configServer,
            remoteLoggerServer: this.remoteLoggerServer,
            translationService: this.translationService,
            userServer: this.userServer,
            routerService: this.routerService,
            opfabAPIService: this.opfabAPIService,
            entitiesServer: this.entitiesServer,
            groupsServer: this.groupsServer,
            perimetersServer: this.perimetersServer,
            processServer: this.processServer,
            opfabEventStreamServer: this.opfabEventStreamServer,
            adminProcessServer: this.adminProcessServer,
            acknowledgeServer: this.acknowledgeServer,
            businessDataServer: this.businessDataServer,
            cardServer: this.cardServer,
            supervisedEntitiesServer: this.supervisedEntitiesServer,
            externalDevicesServer: this.externalDevicesServer
        });


        this.loadUIConfiguration();
    }

    private loadUIConfiguration() {
        ServicesConfig.load().subscribe({
            //This configuration needs to be loaded first as it defines the authentication mode
            next: () => {
                this.loadEnvironmentName();
                if (this.isUrlCheckActivated()) {
                    this.checkIfAppLoadedInAnotherTab();
                } else {
                    this.launchAuthenticationProcess();
                }
            },
            error: catchError((err, caught) => {
                logger.error('Impossible to load  application' + err);
                return caught;
            })
        });
    }

    private loadEnvironmentName() {
        this.environmentName = ConfigService.getConfigValue('environmentName');
        this.environmentColor = ConfigService.getConfigValue('environmentColor', 'blue');
        if (this.environmentName) {
            this.displayEnvironmentName = true;
        }
    }

    private isUrlCheckActivated(): boolean {
        return ConfigService.getConfigValue('checkIfUrlIsLocked', true);
    }

    private checkIfAppLoadedInAnotherTab(): void {
        this.loadingInProgress = false;
        this.appLoadedInAnotherTabComponent.execute();
        this.appLoadedInAnotherTabComponent.isFinishedWithoutError().subscribe(() => {
            this.launchAuthenticationProcess();
        });
        this.appLoadedInAnotherTabComponent.isFinishedWithErrors().subscribe(() => (this.isDisconnected = true));
    }

    private launchAuthenticationProcess(): void {
        this.loadingInProgress = true;
        logger.info(`Launch authentication process`);
        this.waitForEndOfAuthentication();
        this.authService.initializeAuthentication();
        if (this.authService.getAuthMode() === AuthenticationMode.PASSWORD)
            this.waitForEmptyTokenInStorageToShowLoginForm();
    }

    // Hack : in password mode when the token is not anymore in the storage
    // it means we need to show the login form
    // To have a cleaner code , we need to refactor the code
    // regarding authentication
    private waitForEmptyTokenInStorageToShowLoginForm() {
        if (!window.localStorage.getItem('token')) {
            this.showLoginScreen = true;
            this.loadingInProgress = false;
        } else if (!this.applicationLoaded) setTimeout(() => this.waitForEmptyTokenInStorageToShowLoginForm(), 100);
    }

    private waitForEndOfAuthentication(): void {
        CurrentUserStore.getCurrentUserLogin().subscribe((identifier) => {
            if (identifier) {
                logger.info(`User ${identifier} logged`);
                this.synchronizeUserTokenWithOpfabUserDatabase();
                this.showLoginScreen = false;
                this.userLogin = identifier;
                this.loadSettings();
            }
        });
    }

    private synchronizeUserTokenWithOpfabUserDatabase() {
        UserService.synchronizeWithToken().subscribe({
            next: () => logger.info('Synchronization of user token with user database done'),
            error: () => logger.warn('Impossible to synchronize user token with user database')
        });
    }

    private loadSettings() {
        this.settingsService.getUserSettings().subscribe({
            next: ({ status, data }) => {
                switch (status) {
                    case ServerResponseStatus.OK:
                        logger.info('Settings loaded ' + JSON.stringify(data));
                        ConfigService.overrideConfigSettingsWithUserSettings(data);
                        break;
                    case ServerResponseStatus.NOT_FOUND:
                        logger.info('No settings for user');
                        break;
                    case ServerResponseStatus.FORBIDDEN:
                        logger.error('Access forbidden when loading settings');
                        this.authService.logout();
                        return;
                    default:
                        logger.error('Error when loading settings' + status);
                }
                this.checkIfAccountIsAlreadyUsed();
            }
        });
    }

    private checkIfAccountIsAlreadyUsed(): void {
        this.loadingInProgress = false;
        this.accountAlreadyUsedComponent.execute();
        this.accountAlreadyUsedComponent.isFinishedWithoutError().subscribe(() => {
            this.loadingInProgress = true;
            this.loadAllConfigurations();
        });
    }

    private loadAllConfigurations(): void {
        const requestsToLaunch$ = [
            ConfigService.loadUiMenuConfig(),
            UserService.loadUserWithPerimetersData(),
            EntitiesService.loadAllEntitiesData(),
            GroupsService.loadAllGroupsData(),
            ProcessesService.loadAllProcessesWithLatestVersion(),
            ProcessesService.loadAllProcessesWithAllVersions(),
            ProcessesService.loadProcessGroups(),
            ConfigService.loadMonitoringConfig()
        ];
        Utilities.subscribeAndWaitForAllObservablesToEmitAnEvent(requestsToLaunch$).subscribe({
            next: () => {
                this.loadingInProgress = false;
                GlobalStyleService.loadUserStyle();
                this.chooseActivityArea();
            },
            error: catchError((err, caught) => {
                console.error('Error in application initialization', err);
                return caught;
            })
        });
    }

    private chooseActivityArea(): void {
        this.activityAreaChoiceAfterLoginComponent.execute();
        this.activityAreaChoiceAfterLoginComponent
            .isFinishedWithoutError()
            .subscribe(() => this.finalizeApplicationLoading());
    }

    private finalizeApplicationLoading(): void {
        this.loadingInProgress = true;
        OpfabEventStreamService.initEventStream();
        this.opfabEventStreamServer.getStreamInitDone().subscribe(() => {
            this.applicationLoadedDone.next(true);
            this.applicationLoadedDone.complete();
            this.loadingInProgress = false;
            this.applicationLoaded = true;
        });
        this.lightCardsStoreService.initStore(); // this will effectively open the http stream connection
        this.applicationUpdateService.init();
        this.systemNotificationService.initSystemNotificationService();
        ServicesConfig.finalizeLoading();
    }
}
