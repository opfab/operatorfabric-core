/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, HostListener, TemplateRef, ViewChild} from '@angular/core';
import {LogOption, LoggerService as logger} from 'app/services/logs/LoggerService';
import {RemoteLoggerService} from 'app/services/logs/RemoteLoggerService';
import {SoundNotificationService} from '@ofServices/notifications/SoundNotificationService';
import {OpfabEventStreamService} from './business/services/events/opfabEventStream.service';
import {RouterNavigationService} from 'app/router/router-navigation.service';
import {PageType, RouterStore} from './business/store/router.store';
import {ApplicationLoadingComponent} from './modules/core/application-loading/application-loading.component';
import {NgIf} from '@angular/common';
import {AlertComponent} from './modules/core/alert/alert.component';
import {NavbarComponent} from './modules/navbar/navbar.component';
import {RouterOutlet} from '@angular/router';
import {ConnectionLostComponent} from './modules/core/connection-lost/connection-lost.component';
import {SessionEndComponent} from './modules/core/session-end/session-end.component';
import {ReloadRequiredComponent} from './modules/core/reload-required/reload-required.component';

@Component({
    selector: 'of-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: true,
    imports: [
        ApplicationLoadingComponent,
        NgIf,
        AlertComponent,
        NavbarComponent,
        RouterOutlet,
        ConnectionLostComponent,
        SessionEndComponent,
        ReloadRequiredComponent
    ]
})
export class AppComponent {
    public applicationLoaded = false;

    @ViewChild('reloadRequested') reloadRequestedPopupRef: TemplateRef<any>;

    @HostListener('document:visibilitychange')
    onVisibilityChange() {
        if (document.hidden) {
            logger.info('Application tab is not visible anymore', LogOption.REMOTE);
        } else {
            logger.info('Application tab is visible again', LogOption.REMOTE);
        }
        return null;
    }

    // On chrome or edge chromium, when exiting opfab via changing url in the browser tab
    // the long polling HTTP connection is not closed due to the back/forward mechanism (see https://web.dev/bfcache/)
    // this method force the closing of the HTTP connection when exiting opfab page
    @HostListener('window:beforeunload')
    onBeforeUnload() {
        logger.info('Unload opfab', LogOption.LOCAL_AND_REMOTE);
        OpfabEventStreamService.closeEventStream();
        RemoteLoggerService.flush(); // flush log before exiting opfab
        return null;
    }

    // Due to the previous method, when user use browser back function to return to opfab
    // if the back forward cache mechanism is activated, opfab is restored from browser memory but
    // the HTTP long polling connection is closed
    // so we need to reinitialize the application

    @HostListener('window:pageshow', ['$event'])
    pageShow(event) {
        if (event.persisted) {
            logger.info('This page was restored from the bfcache , force opfab restart ', LogOption.LOCAL);
            location.reload();
        }
    }

    @HostListener('document:click', ['$event.target'])
    public onPageClickClearSoundNotification() {
        const pageType = RouterStore.getCurrentPageType();
        if (pageType === PageType.FEED) SoundNotificationService.clearOutstandingNotifications();
    }

    constructor(
        private readonly routerNavigationService: RouterNavigationService // put it here to have it injected and started a startup
    ) {}

    onApplicationLoaded() {
        this.applicationLoaded = true;
    }
}
