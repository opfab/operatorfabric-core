/* Copyright (c) 2018-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, HostListener, TemplateRef, ViewChild} from '@angular/core';
import {AppState} from '@ofStore/index';
import {CardService} from '@ofServices/card.service';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {LogOption, OpfabLoggerService} from '@ofServices/logs/opfab-logger.service';
import {RemoteLoggerService} from '@ofServices/logs/remote-logger.service';
import {Store} from '@ngrx/store';
import {SoundNotificationService} from '@ofServices/sound-notification.service';

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
            this.logger.info('Application tab is not visible anymore', LogOption.REMOTE);
        } else {
            this.logger.info('Application tab is visible again', LogOption.REMOTE);
        }
        return null;
    }

    // On chrome or edge chromium, when exiting opfab via changing url in the browser tab
    // the long polling HTTP connection is not closed due to the back/forward mechanism (see https://web.dev/bfcache/)
    // this method force the closing of the HTTP connection when exiting opfab page
    @HostListener('window:beforeunload')
    onBeforeUnload() {
        this.logger.info('Unload opfab', LogOption.LOCAL_AND_REMOTE);
        this.cardService.closeSubscription();
        this.remoteLogger.flush(); // flush log before exiting opfab
        return null;
    }

    // Due to the previous method, when user use browser back function to return to opfab
    // if the back forward cache mechanism is activated, opfab is restored from browser memory but
    // the HTTP long polling connection is closed
    // so we need to reinitialize the application

    @HostListener('window:pageshow', ['$event'])
    pageShow(event) {
        if (event.persisted) {
            this.logger.info('This page was restored from the bfcache , force opfab restart ', LogOption.LOCAL);
            location.reload();
        }
    }

    @HostListener('document:click', ['$event.target'])
    public onPageClickClearSoundNotification() {
        this.soundNotificationService.clearOutstandingNotifications();
    }

    constructor(
        private store: Store<AppState>,
        private cardService: CardService,
        private modalService: NgbModal,
        private soundNotificationService: SoundNotificationService,
        private logger: OpfabLoggerService,
        private remoteLogger: RemoteLoggerService
    ) {}

    onApplicationLoaded() {
        this.applicationLoaded = true;

    }
}
