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

import {LoggerService as logger} from 'app/services/logs/LoggerService';
import {LocationStrategy, HashLocationStrategy, CommonModule} from '@angular/common';
import {HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {TokenInjector} from 'app/server/interceptors.service';
import {AcknowledgeServer} from './app/services/acknowlegment/server/AcknowledgeServer';
import {AngularAcknowledgeServer} from './app/services/acknowlegment/server/AngularAcknowledgementServer';
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
import {RemoteLoggerServer} from './app/services/logs/server/RemoteLoggerServer';
import {AngularRemoteLoggerServer} from './app/services/logs/server/AngularRemoteLoggerServer';
import {ConfigServer} from './app/services/config/server/ConfigServer';
import {AngularConfigServer} from './app/services/config/server/AngularConfigServer';
import {TemplateCssServer} from './app/business/server/template-css.server';
import {AngularTemplateCssServer} from './app/server/angularTemplate-css.service';
import {ProcessesServer} from './app/services/processes/server/ProcessesServer';
import {AngularProcessesServer} from './app/services/processes/server/AngularProcessesServer';
import {BusinessDataServer} from './app/services/businessdata/server/BusinessDataServer';
import {AngularBusinessDataServer} from './app/services/businessdata/server/AngularBusinessData.server';
import {SettingsServer} from './app/business/server/settings.server';
import {AngularSettingsServer} from './app/server/angularSettings.server';
import {OpfabEventStreamServer} from './app/business/server/opfabEventStream.server';
import {AngularOpfabEventStreamServer} from './app/server/angularOpfabEventStream.server';
import {ExternalDevicesServer} from './app/services/notifications/server/ExternalDevicesServer';
import {AngularExternalDevicesServer} from './app/services/notifications/server/AngularExternalDevicesServer';
import {CardServer} from './app/business/server/card.server';
import {AngularCardServer} from './app/server/angularCard.server';
import {SoundServer} from './app/services/notifications/server/SoundServer';
import {AngularSoundServer} from './app/services/notifications/server/AngularSoundServer';
import {TranslationLib} from './app/services/translation/lib/TranslationLib';
import {AngularTranslationLib} from '@ofServices/translation/lib/AngularTranslationLib';
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
import {NgxDaterangepickerMd} from 'ngx-daterangepicker-material';

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
            NgxDaterangepickerMd.forRoot()
        ),
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
        {provide: ProcessesServer, useClass: AngularProcessesServer},
        {provide: BusinessDataServer, useClass: AngularBusinessDataServer},
        {provide: SettingsServer, useClass: AngularSettingsServer},
        {provide: OpfabEventStreamServer, useClass: AngularOpfabEventStreamServer},
        {provide: ExternalDevicesServer, useClass: AngularExternalDevicesServer},
        {provide: CardServer, useClass: AngularCardServer},
        {provide: SoundServer, useClass: AngularSoundServer},
        {provide: TranslationLib, useClass: AngularTranslationLib},
        {provide: ModalServer, useClass: NgbModalServer},
        {provide: SharingService, useClass: SharingService},
        provideHttpClient(withInterceptorsFromDi()),
        provideAnimations()
    ]
}).catch((err) => logger.error(JSON.stringify(err)));
