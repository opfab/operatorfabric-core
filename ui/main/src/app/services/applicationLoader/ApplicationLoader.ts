/* Copyright (c) 2023-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {firstValueFrom} from 'rxjs';
import {ConfigService} from '../config/ConfigService';
import {LoggerService as logger, LogOption} from 'app/services/logs/LoggerService';
import {RemoteLoggerService} from '../logs/RemoteLoggerService';
import {TranslationService} from '../translation/TranslationService';
import {UsersService} from '../users/UsersService';
import {OpfabAPI} from '../../api/opfab.api';
import {GlobalStyleService} from '../style/global-style.service';
import {EntitiesService} from '../entities/EntitiesService';
import {GroupsService} from '../groups/GroupsService';
import {PerimetersService} from '../perimeters/PerimetersService';
import {ProcessesService} from '../processes/ProcessesService';
import {OpfabEventStreamService} from '../events/OpfabEventStreamService';
import {AcknowledgeService} from '../acknowlegment/AcknowledgeService';
import {DateTimeFormatterService} from '../dateTimeFormatter/DateTimeFormatterService';
import {AdminProcessesService} from '../admin/AdminProcessesService';
import {BusinessDataService} from '../businessdata/businessdata.service';
import {CardsService} from '../cards/CardsService';
import {SupervisedEntitiesService} from '../admin/SupervisedEntitiesService';
import {HandlebarsService} from '../handlebars/HandlebarsService';
import {ExternalDevicesService} from '../notifications/ExternalDevicesService';
import {TemplateCssService} from '../templateCss/TemplateCssService';
import {UserSettingsService} from '../userSettings/UserSettingsService';
import {NavigationService} from '../navigation/NavigationService';
import {OpfabStore} from '../../store/opfabStore';
import {ApplicationUpdateService} from '../events/ApplicationUpdateService';
import {SystemNotificationService} from '../notifications/SystemNotificationService';
import {ApplicationLoadingComponent} from './ApplicationLoadingComponent';
import {ServerResponseStatus} from '../../server/ServerResponse';
import {Utilities} from '../../utils/utilities';
import {ModalService} from '../modal/ModalService';
import {SessionManagerService} from '../sessionManager/SessionManagerService';
import {SoundNotificationService} from '../notifications/SoundNotificationService';
import {RealTimeDomainService} from '../realTimeDomain/RealTimeDomainService';
import {NotificationDecision} from '../notifications/NotificationDecision';
import {CardTemplateGateway} from '../templateGateway/CardTemplateGateway';
import {UserCardTemplateGateway} from '../templateGateway/UserCardTemplateGateway';
import {SelectedCardService} from '@ofServices/selectedCard/SelectedCardService';
import {UserActionLogsService} from '@ofServices/userActionLogs/UserActionLogsService';
import {I18n} from 'app/model/I18n';

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
        TranslationService.setConfigServer(servers.configServer);
        TranslationService.setTranslationLib(servers.translationLib);
        UsersService.setUsersServer(servers.usersServer);
        NavigationService.setApplicationRouter(servers.applicationRouter);
        EntitiesService.setEntitiesServer(servers.entitiesServer);
        GroupsService.setGroupsServer(servers.groupsServer);
        PerimetersService.setPerimeterServer(servers.perimetersServer);
        ProcessesService.setProcessServer(servers.processesServer);
        OpfabEventStreamService.setEventStreamServer(servers.opfabEventStreamServer);
        AcknowledgeService.setAcknowledgeServer(servers.acknowledgeServer);
        AdminProcessesService.setAdminProcessesServer(servers.adminProcessesServer);
        BusinessDataService.setBusinessDataServer(servers.businessDataServer);
        CardsService.setCardsServer(servers.cardsServer);
        SupervisedEntitiesService.setSupervisedEntitiesServer(servers.supervisedEntitiesServer);
        ExternalDevicesService.setExternalDevicesServer(servers.externalDevicesServer);
        HandlebarsService.setHandlebarsTemplateServer(servers.handlebarsTemplateServer);
        TemplateCssService.setTemplatecssServer(servers.templateCssServer);
        UserSettingsService.setUserSettingsServer(servers.userSettingsServer);
        ModalService.setModalComponent(servers.modalComponent);
        SessionManagerService.init(servers.authService);
        SoundNotificationService.setSoundServer(servers.soundServer);
        UserActionLogsService.setUserActionLogsServer(servers.userActionLogsServer);
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
        this.loadCustomStyles(); // could be done in parallel as soon as possible

        if (await this.isLoadingToBeStoppedBecauseAppLoadedInAnotherTab()) return false;
        await this.authenticate();
        await this.loadSettings();
        if (await this.isUserToBeDisconnectedBecauseLoginAlreadyInUse()) return false;
        await this.loadAllConfigurationData();
        if (await this.isUserToBeDisconnectedBecauseIsNotAssociatedToAnyGroups()) return false;
        GlobalStyleService.loadUserStyle();
        await this.setActivityArea();
        this.initOpfabAPI();
        await this.loadCustomScripts();
        this.initServices();
        await this.waitForStreamInitDone();
        logger.info('Card stream connection established');
        RealTimeDomainService.init(); // important to be after the stream init done
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
            TranslationService.loadGlobalTranslations(locales).subscribe(() => {
                logger.info('opfab translation loaded for locales: ' + locales, LogOption.LOCAL_AND_REMOTE);
                TranslationService.loadTranslationForMenu();
                TranslationService.setTranslationForRichTextEditor();
            });
        } else logger.error('No locales define (value i18.supported.locales not present in web-ui.json)');

        TranslationService.initLocale();
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
        UsersService.synchronizeWithToken().subscribe({
            next: () => logger.info('Synchronization of user token with user database done'),
            error: () => logger.warn('Impossible to synchronize user token with user database')
        });
    }

    private async loadSettings(): Promise<void> {
        const {status, data} = await firstValueFrom(UserSettingsService.getUserSettings());
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
            UsersService.willNewSubscriptionDisconnectAnExistingSubscription()
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
            UsersService.loadUserWithPerimetersData(),
            EntitiesService.loadAllEntitiesData(),
            GroupsService.loadAllGroupsData(),
            ProcessesService.loadAllProcessesWithLatestVersion(),
            ProcessesService.loadAllProcessesWithAllVersions(),
            ProcessesService.loadProcessGroups(),
            ConfigService.loadMonitoringConfig(),
            ConfigService.loadProcessMonitoringConfig()
        ];
        return firstValueFrom(Utilities.subscribeAndWaitForAllObservablesToEmitAnEvent(requestsToLaunch$));
    }

    private async isUserToBeDisconnectedBecauseIsNotAssociatedToAnyGroups(): Promise<boolean> {
        if (
            UsersService.getCurrentUserWithPerimeters().userData.groups === undefined ||
            UsersService.getCurrentUserWithPerimeters().userData.groups.length === 0
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
        NotificationDecision.init();
        SystemNotificationService.initSystemNotificationService();
        SoundNotificationService.initSoundService();
        HandlebarsService.init();
        SelectedCardService.init();
    }

    private async waitForStreamInitDone(): Promise<void> {
        await this.opfabEventStreamServer.getStreamInitDone().toPromise();
    }

    private initOpfabAPI(): void {
        CardTemplateGateway.init();
        UserCardTemplateGateway.init();
        OpfabAPI.initAPI();
    }

    private goToEntryPage() {
        if (NavigationService.getCurrentRoute() === '/') {
            const defaultEntryPage = ConfigService.getConfigValue('defaultEntryPage', 'feed');
            NavigationService.navigateTo(defaultEntryPage);
        }
    }

    private async loadCustomScripts() {
        const customScripts = ConfigService.getConfigValue('customJsToLoad');
        if (customScripts) {
            for (const script of customScripts) {
                await import(/* @vite-ignore */ script).catch((err) =>
                    logger.error('Error loading custom script ' + script + ' : ' + err)
                );
            }
        }
    }

    private loadCustomStyles() {
        const customStyles = ConfigService.getConfigValue('customCssToLoad');
        if (customStyles) {
            for (const style of customStyles) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = style;
                document.head.appendChild(link);
            }
        }
    }
}
