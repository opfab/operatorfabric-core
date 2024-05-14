/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {firstValueFrom} from 'rxjs';
import {ConfigService} from './services/config.service';
import {LoggerService as logger, LogOption} from 'app/business/services/logs/logger.service';
import {RemoteLoggerService} from './services/logs/remote-logger.service';
import {I18nService} from './services/translation/i18n.service';
import {UserService} from './services/users/user.service';
import {OpfabAPIService} from './services/opfabAPI.service';
import {loadBuildInTemplates} from './buildInTemplates/templatesLoader';
import {GlobalStyleService} from './services/global-style.service';
import {EntitiesService} from './services/users/entities.service';
import {GroupsService} from './services/users/groups.service';
import {PerimetersService} from './services/users/perimeters.service';
import {ProcessesService} from './services/businessconfig/processes.service';
import {OpfabEventStreamService} from './services/events/opfabEventStream.service';
import {AcknowledgeService} from './services/acknowledge.service';
import {DateTimeFormatterService} from './services/date-time-formatter.service';
import {AdminProcessesService} from './services/businessconfig/adminprocess.service';
import {BusinessDataService} from './services/businessconfig/businessdata.service';
import {CardService} from './services/card/card.service';
import {SupervisedEntitiesService} from './services/users/supervised-entities.service';
import {SelectedCardLoaderService} from './services/card/selectedCardLoader.service';
import {HandlebarsService} from './services/card/handlebars.service';
import {ExternalDevicesService} from './services/notifications/external-devices.service';
import {TemplateCssService} from './services/card/template-css.service';
import {SettingsService} from './services/users/settings.service';
import {RouterService} from './services/router.service';
import {OpfabStore} from './store/opfabStore';
import {ApplicationUpdateService} from './services/events/application-update.service';
import {SystemNotificationService} from './services/notifications/system-notification.service';
import {ApplicationLoadingComponent} from './application-loading-component';
import {ServerResponseStatus} from './server/serverResponse';
import {Utilities} from './common/utilities';
import {ModalService} from './services/modal.service';
import {SessionManagerService} from './services/session-manager.service';
import {SoundNotificationService} from './services/notifications/sound-notification.service';
import {I18n} from '@ofModel/i18n.model';
import {ProcessStatesMultiSelectOptionsService} from './services/process-states-multi-select-options.service';

declare const opfab: any;

export class ApplicationLoader {
    public displayEnvironmentName = false;
    public environmentName: string;
    public environmentColor: string;
    public loadingInProgress = true;
    public isDisconnected = false;
    public isAllowedToAccessOpfab = true;
    public userLogin;

    private appLoadedInAnotherTabComponent: ApplicationLoadingComponent;
    private activityAreaChoiceAfterLoginComponent: ApplicationLoadingComponent;
    private methodToAuthenticate: Function;
    private opfabEventStreamServer;

    public setServers(servers) {
        ConfigService.setConfigServer(servers.configServer);
        RemoteLoggerService.setRemoteLoggerServer(servers.remoteLoggerServer);
        I18nService.setConfigServer(servers.configServer);
        I18nService.setTranslationService(servers.translationService);
        UserService.setUserServer(servers.userServer);
        RouterService.setApplicationRouter(servers.routerService);
        EntitiesService.setEntitiesServer(servers.entitiesServer);
        GroupsService.setGroupsServer(servers.groupsServer);
        PerimetersService.setPerimeterServer(servers.perimetersServer);
        ProcessesService.setProcessServer(servers.processServer);
        OpfabEventStreamService.setEventStreamServer(servers.opfabEventStreamServer);
        AcknowledgeService.setAcknowledgeServer(servers.acknowledgeServer);
        AdminProcessesService.setAdminProcessServer(servers.adminProcessServer);
        BusinessDataService.setBusinessDataServer(servers.businessDataServer);
        CardService.setCardServer(servers.cardServer);
        SupervisedEntitiesService.setSupervisedEntitiesServer(servers.supervisedEntitiesServer);
        ExternalDevicesService.setExternalDevicesServer(servers.externalDevicesServer);
        TemplateCssService.setTemplatecssServer(servers.templateCssServer);
        SettingsService.setSettingsServer(servers.settingsServer);
        ModalService.setModalServer(servers.modalServer);
        OpfabAPIService.setTranslationService(servers.translationService);
        SessionManagerService.init(servers.authService);
        SoundNotificationService.setSoundServer(servers.soundServer);
        ProcessStatesMultiSelectOptionsService.init(servers.translationService);

        this.opfabEventStreamServer = servers.opfabEventStreamServer;
    }

    public setAppLoadedInAnotherTabComponent(appLoadedInAnotherTabComponent: ApplicationLoadingComponent) {
        this.appLoadedInAnotherTabComponent = appLoadedInAnotherTabComponent;
    }

    public setMethodToAuthenticate(methodToAuthenticate: any) {
        this.methodToAuthenticate = methodToAuthenticate;
    }

    public setActivityAreaChoiceAfterLoginComponent(
        activityAreaChoiceAfterLoginComponent: ApplicationLoadingComponent
    ) {
        this.activityAreaChoiceAfterLoginComponent = activityAreaChoiceAfterLoginComponent;
    }

    public async startOpfab(): Promise<boolean> {
        this.setDefaultStyle();
        await this.loadWebUiConfig();
        this.setTitleInBrowser();
        this.setLoggerConfiguration();
        this.loadTranslations();
        this.setEnvironmentNameAndColor();
        if (await this.isLoadingToBeStoppedBecauseAppLoadedInAnotherTab()) return false;
        await this.authenticate();
        await this.loadSettings();
        if (await this.isUserToBeDisconnectedBecauseLoginAlreadyInUse()) return false;
        await this.loadAllConfigurationData();
        if (await this.isUserToBeDisconnectedBecauseIsNotAssociatedToAnyGroups()) return false;
        GlobalStyleService.loadUserStyle();
        await this.setActivityArea();
        this.initServices();
        loadBuildInTemplates();
        this.initOpfabAPI();
        await this.waitForStreamInitDone();
        this.goToEntryPage();
        this.loadingInProgress = false;
        return true;
    }

    private setDefaultStyle() {
        GlobalStyleService.init();
    }

    private async loadWebUiConfig() {
        const config = await firstValueFrom(ConfigService.loadWebUIConfiguration());
        if (!config) {
            throw new Error('Configuration not loaded (web-ui.json)');
        }
        logger.info(`Configuration loaded (web-ui.json)`);
    }

    private setLoggerConfiguration() {
        ConfigService.getConfigValueAsObservable('settings.remoteLoggingEnabled', false).subscribe(
            (remoteLoggingEnabled) => RemoteLoggerService.setRemoteLoggerActive(remoteLoggingEnabled)
        );
    }

    private setTitleInBrowser() {
        document.title = ConfigService.getConfigValue('title', 'OperatorFabric');
    }

    private loadTranslations() {
        const locales = ConfigService.getConfigValue('i18n.supported.locales');
        if (locales) {
            I18nService.loadGlobalTranslations(locales).subscribe(() => {
                logger.info('opfab translation loaded for locales: ' + locales, LogOption.LOCAL_AND_REMOTE);
                I18nService.loadTranslationForMenu();
                I18nService.setTranslationForMultiSelectUsedInTemplates();
                I18nService.setTranslationForRichTextEditor();
            });
        } else logger.error('No locales define (value i18.supported.locales not present in web-ui.json)');

        I18nService.initLocale();
        DateTimeFormatterService.init();
    }

    private setEnvironmentNameAndColor() {
        this.environmentName = ConfigService.getConfigValue('environmentName');
        this.environmentColor = ConfigService.getConfigValue('environmentColor', 'blue');
        if (this.environmentName) {
            this.displayEnvironmentName = true;
        }
    }

    private async isLoadingToBeStoppedBecauseAppLoadedInAnotherTab(): Promise<boolean> {
        this.loadingInProgress = false;
        if (this.isUrlCheckActivated() && !(await this.appLoadedInAnotherTabComponent.execute())) {
            this.isDisconnected = true;
            return true;
        }
        this.loadingInProgress = true;
        return false;
    }

    private isUrlCheckActivated(): boolean {
        return ConfigService.getConfigValue('checkIfUrlIsLocked', true);
    }

    private async authenticate(): Promise<void> {
        this.userLogin = await this.methodToAuthenticate();
        if (!this.userLogin) throw new Error('Authentication failed');
        logger.info(`User ${this.userLogin} logged`);
        this.synchronizeUserTokenWithOpfabUserDatabase();
    }

    private synchronizeUserTokenWithOpfabUserDatabase() {
        UserService.synchronizeWithToken().subscribe({
            next: () => logger.info('Synchronization of user token with user database done'),
            error: () => logger.warn('Impossible to synchronize user token with user database')
        });
    }

    private async loadSettings(): Promise<void> {
        const {status, data} = await firstValueFrom(SettingsService.getUserSettings());
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
                return;
            default:
                logger.error('Error when loading settings' + status);
        }
    }

    private async isUserToBeDisconnectedBecauseLoginAlreadyInUse(): Promise<boolean> {
        this.loadingInProgress = false;
        const isAccountAlreadyUsed = await firstValueFrom(
            UserService.willNewSubscriptionDisconnectAnExistingSubscription()
        );

        if (isAccountAlreadyUsed) {
            logger.info(`Login ${this.userLogin} is already connected`, LogOption.LOCAL_AND_REMOTE);
            const confirmLogin = await ModalService.openConfirmationModal(
                undefined,
                new I18n('login.confirmationBecauseAccountIsAreadyUsed', {login: this.userLogin})
            );
            if (confirmLogin) {
                logger.info(`Login as ${this.userLogin} even if account is already used`, LogOption.REMOTE);
                return false;
            } else {
                logger.info(`Logout with user ${this.userLogin} because account already used`, LogOption.REMOTE);
                SessionManagerService.logout();
                return true;
            }
        }
        logger.info(`Login ${this.userLogin} is not already used`, LogOption.LOCAL_AND_REMOTE);
        this.loadingInProgress = true;
        return false;
    }

    private async loadAllConfigurationData(): Promise<any[]> {
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
        return firstValueFrom(Utilities.subscribeAndWaitForAllObservablesToEmitAnEvent(requestsToLaunch$));
    }

    private async isUserToBeDisconnectedBecauseIsNotAssociatedToAnyGroups(): Promise<boolean> {
        if (
            UserService.getCurrentUserWithPerimeters().userData.groups === undefined ||
            UserService.getCurrentUserWithPerimeters().userData.groups.length === 0
        ) {
            this.isAllowedToAccessOpfab = false;
            await ModalService.openInformationModal(new I18n('global.isNotAllowedToAccessOpfab'));
            SessionManagerService.logout();
            return true;
        }
        return false;
    }

    private async setActivityArea(): Promise<void> {
        this.loadingInProgress = false;
        await this.activityAreaChoiceAfterLoginComponent.execute();
        logger.info('Activity area settings done');
        this.loadingInProgress = true;
    }

    private initServices() {
        OpfabEventStreamService.initEventStream();
        OpfabStore.init(); // this will effectively open the http stream connection
        ApplicationUpdateService.init();
        SystemNotificationService.initSystemNotificationService();
        SoundNotificationService.initSoundService();
        HandlebarsService.init();
        SelectedCardLoaderService.init();
    }

    private async waitForStreamInitDone(): Promise<void> {
        await this.opfabEventStreamServer.getStreamInitDone().toPromise();
    }

    private initOpfabAPI(): void {
        OpfabAPIService.init();
        opfab.navigate.showCardInFeed = function (cardId: string) {
            RouterService.navigateTo('feed/cards/' + cardId);
        };

        OpfabAPIService.initAPI();
    }

    private goToEntryPage() {
        if (RouterService.getCurrentRoute() === '/') {
            const defaultEntryPage = ConfigService.getConfigValue('defaultEntryPage', 'feed');
            RouterService.navigateTo(defaultEntryPage);
        }
    }
}
