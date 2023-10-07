/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, HostListener, TemplateRef, ViewChild} from '@angular/core';
import {NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {LogOption, LoggerService as logger} from 'app/business/services/logs/logger.service';
import {RemoteLoggerService} from 'app/business/services/logs/remote-logger.service';
import {SoundNotificationService} from 'app/business/services/notifications/sound-notification.service';
import {OpfabEventStreamService} from './business/services/events/opfabEventStream.service';
import {RouterNavigationService} from 'app/router/router-navigation.service';
import {SelectedCardLoaderService} from './business/services/card/selectedCardLoader.service';
import {PageType, RouterStore} from './business/store/router.store';

@Component({
    selector: 'of-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {

    reloadCanceled: boolean;

    public applicationLoaded = false;

    private modalRef: NgbModalRef;
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
        this.opfabEventStreamService.closeEventStream();
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
        const pageType =  RouterStore.getInstance().getCurrentPageType();
        if (pageType === PageType.FEED) this.soundNotificationService.clearOutstandingNotifications();
    }

    constructor(
        private soundNotificationService: SoundNotificationService,
        private opfabEventStreamService: OpfabEventStreamService,
        private routerNavigationService: RouterNavigationService, // put it here to have it injected and started a startup
        private selectedCardLoaderService: SelectedCardLoaderService  // put it here to have it injected and started a startup
    ) {
    }

    onApplicationLoaded() {
        this.applicationLoaded = true;

    }
}
