/* Copyright (c) 2022-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, OnInit, Output, ViewChild} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {TranslateService} from '@ngx-translate/core';
import {ConfigService} from 'app/business/services/config.service';
import {EntitiesService} from 'app/business/services/entities.service';
import {GroupsService} from 'app/business/services/groups.service';
import {I18nService} from 'app/business/services/i18n.service';
import {LogOption, OpfabLoggerService} from 'app/business/services/logs/opfab-logger.service';
import {ProcessesService} from 'app/business/services/processes.service';
import {ReminderService} from 'app/business/services/reminder/reminder.service';
import {UserService} from 'app/business/services/user.service';
import {Utilities} from 'app/business/common/utilities';
import {catchError, Subject} from 'rxjs';
import {ActivityAreaChoiceAfterLoginComponent} from './activityarea-choice-after-login/activityarea-choice-after-login.component';
import {AccountAlreadyUsedComponent} from './account-already-used/account-already-used.component';
import {AppLoadedInAnotherTabComponent} from './app-loaded-in-another-tab/app-loaded-in-another-tab.component';
import {SettingsService} from 'app/business/services/settings.service';
import {GlobalStyleService} from 'app/business/services/global-style.service';
import {RRuleReminderService} from 'app/business/services/rrule-reminder/rrule-reminder.service';
import {OpfabEventStreamServer} from 'app/business/server/opfabEventStream.server';
import {OpfabEventStreamService} from 'app/business/services/opfabEventStream.service';
import {LightCardsStoreService} from 'app/business/services/lightcards/lightcards-store.service';
import {ApplicationUpdateService} from 'app/business/services/application-update.service';
import {ServerResponseStatus} from 'app/business/server/serverResponse';
import {CurrentUserStore} from 'app/business/store/current-user.store';
import {AuthService} from 'app/authentication/auth.service';
import {AuthenticationMode} from 'app/authentication/auth.model';

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

    /**
     * NB: I18nService is injected to trigger its constructor at application startup
     */
    constructor(
        private titleService: Title,
        private authService: AuthService,
        private configService: ConfigService,
        private settingsService: SettingsService,
        private translateService: TranslateService,
        private i18nService: I18nService,
        private userService: UserService,
        private entitiesService: EntitiesService,
        private groupsService: GroupsService,
        private processesService: ProcessesService,
        private reminderService: ReminderService,
        private rRuleReminderService: RRuleReminderService,
        private logger: OpfabLoggerService,
        private globalStyleService: GlobalStyleService,
        private lightCardsStoreService: LightCardsStoreService,
        private opfabEventStreamServer: OpfabEventStreamServer,
        private opfabEventStreamService: OpfabEventStreamService,
        private applicationUpdateService: ApplicationUpdateService,
        private currentUserStore: CurrentUserStore
    ) {}

    ngOnInit() {
        // Set default style before login
        this.globalStyleService.setStyle('NIGHT');
        this.loadUIConfiguration();
    }

    private loadUIConfiguration() {
        this.configService.loadWebUIConfiguration().subscribe({
            //This configuration needs to be loaded first as it defines the authentication mode
            next: (config) => {
                if (!!config) {
                    this.logger.info(`Configuration loaded (web-ui.json)`);
                    this.setTitleInBrowser();
                    this.loadTranslation(config);
                    this.loadEnvironmentName();
                } else {
                    this.logger.info('No valid web-ui.json configuration file, stop application loading');
                }
            },
            error: catchError((err, caught) => {
                this.logger.error('Impossible to load configuration file web-ui.json' + err);
                return caught;
            })
        });
    }

    private loadEnvironmentName() {
        this.environmentName = this.configService.getConfigValue('environmentName');
        this.environmentColor = this.configService.getConfigValue('environmentColor', 'blue');
        if (!!this.environmentName) {
            this.displayEnvironmentName = true;
        }
    }

    private setTitleInBrowser() {
        const title = this.configService.getConfigValue('title', 'OperatorFabric');
        this.titleService.setTitle(title);
    }

    private loadTranslation(config) {
        if (!!config.i18n.supported.locales) {
            this.i18nService.loadGlobalTranslations(config.i18n.supported.locales).subscribe(() => {
                this.logger.info(
                    'opfab translation loaded for locales: ' + this.translateService.getLangs(),
                    LogOption.LOCAL_AND_REMOTE
                );
                this.i18nService.loadTranslationForMenu();
                this.i18nService.setTranslationForMultiSelectUsedInTemplates();

                if (this.isUrlCheckActivated()) {
                    this.checkIfAppLoadedInAnotherTab();
                } else {
                    this.launchAuthenticationProcess();
                }
            });
        } else this.logger.error('No locales define (value i18.supported.locales not present in web-ui.json)');
        this.i18nService.initLocale();
    }

    private isUrlCheckActivated(): boolean {
        return this.configService.getConfigValue('checkIfUrlIsLocked', true);
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
        this.logger.info(`Launch authentication process`);
        this.waitForEndOfAuthentication();
        this.authService.initializeAuthentication();
        if (this.authService.getAuthMode()=== AuthenticationMode.PASSWORD)
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
        this.currentUserStore.getCurrentUserLogin().subscribe((identifier) => {
            if (identifier) {
                this.logger.info(`User ${identifier} logged`);
                this.synchronizeUserTokenWithOpfabUserDatabase();
                this.showLoginScreen = false;
                this.userLogin = identifier;
                this.loadSettings();
            }
        });
    }

    private synchronizeUserTokenWithOpfabUserDatabase() {
        this.userService.synchronizeWithToken().subscribe({
            next: () =>  this.logger.info("Synchronization of user token with user database done"),
            error: () => this.logger.warn("Impossible to synchronize user token with user database")
        });
    }

    private loadSettings() {
        this.settingsService.getUserSettings().subscribe({
            next: (response) => {
                if (response.status === ServerResponseStatus.OK){
                    this.logger.info(new Date().toISOString() + `Settings loaded` + response.data);
                    this.configService.overrideConfigSettingsWithUserSettings(response.data);
                    this.checkIfAccountIsAlreadyUsed();
                } else {
                    if (response.status === ServerResponseStatus.NOT_FOUND) console.log(new Date().toISOString(), 'No settings for user');
                    else this.logger.error(new Date().toISOString() + 'Error when loading settings' + response.status);
                    this.checkIfAccountIsAlreadyUsed();
                }
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
            this.configService.loadCoreMenuConfigurations(),
            this.userService.loadUserWithPerimetersData(),
            this.entitiesService.loadAllEntitiesData(),
            this.groupsService.loadAllGroupsData(),
            this.processesService.loadAllProcesses(),
            this.processesService.loadProcessGroups(),
            this.processesService.loadMonitoringConfig()
        ];
        Utilities.subscribeAndWaitForAllObservablesToEmitAnEvent(requestsToLaunch$).subscribe({
            next: () => {
                this.loadingInProgress = false;
                this.globalStyleService.loadUserStyle();
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
        this.activityAreaChoiceAfterLoginComponent.isFinishedWithoutError().subscribe(() => this.finalizeApplicationLoading());
    }

    private finalizeApplicationLoading(): void {
        this.loadingInProgress = true;
        this.opfabEventStreamService.initEventStream();
        this.opfabEventStreamServer.getStreamInitDone().subscribe(() => {
            this.applicationLoadedDone.next(true);
            this.applicationLoadedDone.complete();
            this.loadingInProgress = false;
            this.applicationLoaded = true;
        });
        this.lightCardsStoreService.initStore(); // this will effectively open the http stream connection
        this.applicationUpdateService.init();
        this.reminderService.startService(this.userLogin);
        this.rRuleReminderService.startService(this.userLogin);
    }
}
