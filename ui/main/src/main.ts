/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {enableProdMode, importProvidersFrom} from '@angular/core';

import {environment} from './environments/environment';

import {LoggerService as logger} from 'app/business/services/logs/logger.service';
import {SwRegistrationOptions, ServiceWorkerModule} from '@angular/service-worker';
import {Utilities} from './app/business/common/utilities';
import {LocationStrategy, HashLocationStrategy, CommonModule} from '@angular/common';
import {HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {TokenInjector} from 'app/server/interceptors.service';
import {AcknowledgeServer} from './app/business/server/acknowledge.server';
import {AngularAcknowledgeServer} from './app/server/angularAcknowledgement.server';
import {EntitiesServer} from './app/business/server/entities.server';
import {AngularEntitiesServer} from './app/server/angularEntities.server';
import {SupervisedEntitiesServer} from './app/business/server/supervised-entities.server';
import {AngularSupervisedEntitiesServer} from './app/server/angularSupervisedEntities.server';
import {PerimetersServer} from './app/business/server/perimeters.server';
import {AngularPerimetersServer} from './app/server/angularPerimeters.server';
import {GroupsServer} from './app/business/server/groups.server';
import {AngularGroupsServer} from './app/server/angularGroups.server';
import {UserServer} from './app/business/server/user.server';
import {AngularUserServer} from './app/server/angularUser.server';
import {UserActionLogsServer} from './app/business/server/user-action-logs.server';
import {AngularUserActionLogsServer} from './app/server/angularUser-Action-Logs.server';
import {AdminProcessServer} from './app/business/server/adminprocess.server';
import {AngularAdminProcessesServer} from './app/server/angularAdminProcess.server';
import {RemoteLoggerServer} from './app/business/server/remote-logger.server';
import {AngularRemoteLoggerServer} from './app/server/angularRemoteLogger.server';
import {ConfigServer} from './app/business/server/config.server';
import {AngularConfigServer} from './app/server/angularConfig.server';
import {TemplateCssServer} from './app/business/server/template-css.server';
import {AngularTemplateCssServer} from './app/server/angularTemplate-css.service';
import {ProcessServer} from './app/business/server/process.server';
import {AngularProcessServer} from './app/server/angularProcess.server';
import {BusinessDataServer} from './app/business/server/businessData.server';
import {AngularBusinessDataServer} from './app/server/angularBusinessData.server';
import {SettingsServer} from './app/business/server/settings.server';
import {AngularSettingsServer} from './app/server/angularSettings.server';
import {OpfabEventStreamServer} from './app/business/server/opfabEventStream.server';
import {AngularOpfabEventStreamServer} from './app/server/angularOpfabEventStream.server';
import {ExternalDevicesServer} from './app/business/server/external-devices.server';
import {AngularExternalDevicesServer} from './app/server/angularExternalDevices.server';
import {CardServer} from './app/business/server/card.server';
import {AngularCardServer} from './app/server/angularCard.server';
import {SoundServer} from './app/business/server/sound.server';
import {AngularSoundServer} from './app/server/angularSound.server';
import {TranslationService} from './app/business/services/translation/translation.service';
import {AngularTranslationService} from '@ofServices/angularTranslationService';
import {ModalServer} from './app/business/server/modal.server';
import {NgbModalServer} from './app/server/ngbModal.server';
import {SharingService} from './app/modules/admin/services/sharing.service';
import {BrowserModule, bootstrapApplication} from '@angular/platform-browser';
import {provideAnimations} from '@angular/platform-browser/animations';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TagInputModule} from 'ngx-chips';
import {OAuthModule} from 'angular-oauth2-oidc';
import {NgbModule, NgbModalModule} from '@ng-bootstrap/ng-bootstrap';
import {TranslateModule} from '@ngx-translate/core';
import {AppRoutingModule} from './app/router/app-routing.module';
import {AppComponent} from './app/app.component';

if (environment.production) {
    enableProdMode();
}

bootstrapApplication(AppComponent, {
    providers: [
        importProvidersFrom(
            CommonModule,
            BrowserModule,
            FormsModule,
            ReactiveFormsModule,
            TagInputModule,
            OAuthModule.forRoot(),
            NgbModule,
            TranslateModule.forRoot(),
            NgbModalModule,
            AppRoutingModule,
            ServiceWorkerModule.register('ngsw-worker.js')
        ),
        {
            provide: SwRegistrationOptions,
            useFactory: () => ({enabled: shallPWAFeatureBeActivated()})
        },
        {provide: LocationStrategy, useClass: HashLocationStrategy},
        {
            provide: HTTP_INTERCEPTORS,
            useClass: TokenInjector,
            multi: true
        },
        {provide: AcknowledgeServer, useClass: AngularAcknowledgeServer},
        {provide: EntitiesServer, useClass: AngularEntitiesServer},
        {provide: SupervisedEntitiesServer, useClass: AngularSupervisedEntitiesServer},
        {provide: PerimetersServer, useClass: AngularPerimetersServer},
        {provide: GroupsServer, useClass: AngularGroupsServer},
        {provide: UserServer, useClass: AngularUserServer},
        {provide: UserActionLogsServer, useClass: AngularUserActionLogsServer},
        {provide: AdminProcessServer, useClass: AngularAdminProcessesServer},
        {provide: RemoteLoggerServer, useClass: AngularRemoteLoggerServer},
        {provide: ConfigServer, useClass: AngularConfigServer},
        {provide: TemplateCssServer, useClass: AngularTemplateCssServer},
        {provide: ProcessServer, useClass: AngularProcessServer},
        {provide: BusinessDataServer, useClass: AngularBusinessDataServer},
        {provide: SettingsServer, useClass: AngularSettingsServer},
        {provide: OpfabEventStreamServer, useClass: AngularOpfabEventStreamServer},
        {provide: ExternalDevicesServer, useClass: AngularExternalDevicesServer},
        {provide: CardServer, useClass: AngularCardServer},
        {provide: SoundServer, useClass: AngularSoundServer},
        {provide: TranslationService, useClass: AngularTranslationService},
        {provide: ModalServer, useClass: NgbModalServer},
        {provide: SharingService, useClass: SharingService},
        provideHttpClient(withInterceptorsFromDi()),
        provideAnimations()
    ]
}).catch((err) => logger.error(JSON.stringify(err)));

function shallPWAFeatureBeActivated(): boolean {
    const activateSW = Utilities.isNavigatorChromiumBased() && location.href.includes('PWAFeature=true');
    /* eslint-disable-next-line no-console */
    console.log(new Date().toISOString(), 'PWA feature enable : ', activateSW);
    return activateSW;
}
