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
import {Store} from '@ngrx/store';
import {TranslateService} from '@ngx-translate/core';
import {AuthenticationService} from '@ofServices/authentication/authentication.service';
import {ConfigService} from 'app/business/services/config.service';
import {EntitiesService} from '@ofServices/entities.service';
import {GroupsService} from '@ofServices/groups.service';
import {I18nService} from '@ofServices/i18n.service';
import {LogOption, OpfabLoggerService} from '@ofServices/logs/opfab-logger.service';
import {ProcessesService} from 'app/business/services/processes.service';
import {ReminderService} from '@ofServices/reminder/reminder.service';
import {UserService} from '@ofServices/user.service';
import {AppState} from '@ofStore/index';
import {selectIdentifier} from '@ofStore/selectors/authentication.selectors';
import {Utilities} from 'app/business/common/utilities';
import {catchError, Subject} from 'rxjs';
import {ActivityAreaChoiceAfterLoginComponent} from './activityarea-choice-after-login/activityarea-choice-after-login.component';
import {AccountAlreadyUsedComponent} from './account-already-used/account-already-used.component';
import {AppLoadedInAnotherTabComponent} from './app-loaded-in-another-tab/app-loaded-in-another-tab.component';
import {SettingsService} from '@ofServices/settings.service';
import {GlobalStyleService} from '@ofServices/global-style.service';
import {RRuleReminderService} from '@ofServices/rrule-reminder/rrule-reminder.service';
import {OpfabEventStreamServer} from 'app/business/server/opfabEventStream.server';
import {OpfabEventStreamService} from 'app/business/services/opfabEventStream.service';
import {LightCardsStoreService} from '@ofServices/lightcards/lightcards-store.service';
import {ApplicationUpdateService} from 'app/business/services/application-update.service';

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
        private store: Store<AppState>,
        private titleService: Title,
        private authenticationService: AuthenticationService,
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
        private applicationUpdateService: ApplicationUpdateService
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
        this.authenticationService.initializeAuthentication();
        if (!this.authenticationService.isAuthModeCodeOrImplicitFlow() && !this.authenticationService.isAuthModeNone())
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
        this.store.select(selectIdentifier).subscribe((identifier) => {
            if (identifier) {
                this.logger.info(`User ${identifier} logged`);
                this.showLoginScreen = false;
                this.userLogin = identifier;
                this.loadSettings();
            }
        });
    }

    private loadSettings() {
        this.settingsService.fetchUserSettings().subscribe({
            next: (settings) => {
                console.log(new Date().toISOString(), `Settings loaded`, settings);
                this.configService.overrideConfigSettingsWithUserSettings(settings);
                this.checkIfAccountIsAlreadyUsed();
            },
            error: (err) => {
                if (err.status === 404) console.log(new Date().toISOString(), 'No settings for user');
                else console.error(new Date().toISOString(), 'Error when loading settings', err);
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
