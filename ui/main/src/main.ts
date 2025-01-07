/* Copyright (c) 2018-2025, RTE (http://www.rte-france.com)
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
import {EntitiesServer} from './app/services/entities/server/EntitiesServer';
import {AngularEntitiesServer} from './app/services/entities/server/AngularEntitiesServer';
import {SupervisedEntitiesServer} from './app/services/admin/server/SupervisedEntitiesServer';
import {AngularSupervisedEntitiesServer} from './app/services/admin/server/AngularSupervisedEntities.server';
import {PerimetersServer} from './app/services/perimeters/server/PerimetersServer';
import {AngularPerimetersServer} from './app/services/perimeters/server/AngularPerimetersServer';
import {GroupsServer} from './app/services/groups/server/GroupsServer';
import {AngularGroupsServer} from './app/services/groups/server/AngularGroupsServer';
import {UsersServer} from './app/services/users/server/UsersServer';
import {AngularUserServer} from './app/services/users/server/AngularUsersServer';
import {UserActionLogsServer} from './app/business/server/user-action-logs.server';
import {AngularUserActionLogsServer} from './app/server/angularUser-Action-Logs.server';
import {AdminProcessesServer} from './app/services/admin/server/AdminProcessesServer';
import {AngularAdminProcessesServer} from './app/services/admin/server/AngularAdminProcessesServer';
import {RemoteLoggerServer} from './app/services/logs/server/RemoteLoggerServer';
import {AngularRemoteLoggerServer} from './app/services/logs/server/AngularRemoteLoggerServer';
import {ConfigServer} from './app/services/config/server/ConfigServer';
import {AngularConfigServer} from './app/services/config/server/AngularConfigServer';
import {TemplateCssServer} from './app/services/templateCss/server/TemplateCssServer';
import {AngularTemplateCssServer} from './app/services/templateCss/server/AngularTemplateCssServer';
import {ProcessesServer} from './app/services/processes/server/ProcessesServer';
import {AngularProcessesServer} from './app/services/processes/server/AngularProcessesServer';
import {BusinessDataServer} from './app/services/businessdata/server/BusinessDataServer';
import {AngularBusinessDataServer} from './app/services/businessdata/server/AngularBusinessData.server';
import {UserSettingsServer} from './app/services/userSettings/server/UserSettingsServer';
import {AngularUserSettingsServer} from './app/services/userSettings/server/AngularUserSettingsServer';
import {OpfabEventStreamServer} from './app/business/server/opfabEventStream.server';
import {AngularOpfabEventStreamServer} from './app/server/angularOpfabEventStream.server';
import {ExternalDevicesServer} from './app/services/notifications/server/ExternalDevicesServer';
import {AngularExternalDevicesServer} from './app/services/notifications/server/AngularExternalDevicesServer';
import {CardsServer} from './app/services/cards/server/CardsServer';
import {AngularCardsServer} from './app/services/cards/server/AngularCardsServer';
import {SoundServer} from './app/services/notifications/server/SoundServer';
import {AngularSoundServer} from './app/services/notifications/server/AngularSoundServer';
import {TranslationLib} from './app/services/translation/lib/TranslationLib';
import {AngularTranslationLib} from '@ofServices/translation/lib/AngularTranslationLib';
import {ModalComponent} from './app/services/modal/component/ModalComponent';
import {NgbModalComponent} from './app/services/modal/component/NgbModalComponent';
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
import {AngularHandlebarsTemplateServer} from '@ofServices/handlebars/server/AngularHandlebarsTemplateServer';
import {HandlebarsTemplateServer} from '@ofServices/handlebars/server/HandlebarsTemplateServer';

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
        {provide: UsersServer, useClass: AngularUserServer},
        {provide: UserActionLogsServer, useClass: AngularUserActionLogsServer},
        {provide: AdminProcessesServer, useClass: AngularAdminProcessesServer},
        {provide: RemoteLoggerServer, useClass: AngularRemoteLoggerServer},
        {provide: ConfigServer, useClass: AngularConfigServer},
        {provide: TemplateCssServer, useClass: AngularTemplateCssServer},
        {provide: HandlebarsTemplateServer, useClass: AngularHandlebarsTemplateServer},
        {provide: ProcessesServer, useClass: AngularProcessesServer},
        {provide: BusinessDataServer, useClass: AngularBusinessDataServer},
        {provide: UserSettingsServer, useClass: AngularUserSettingsServer},
        {provide: OpfabEventStreamServer, useClass: AngularOpfabEventStreamServer},
        {provide: ExternalDevicesServer, useClass: AngularExternalDevicesServer},
        {provide: CardsServer, useClass: AngularCardsServer},
        {provide: SoundServer, useClass: AngularSoundServer},
        {provide: TranslationLib, useClass: AngularTranslationLib},
        {provide: ModalComponent, useClass: NgbModalComponent},
        {provide: SharingService, useClass: SharingService},
        provideHttpClient(withInterceptorsFromDi()),
        provideAnimations()
    ]
}).catch((err) => logger.error(JSON.stringify(err)));
