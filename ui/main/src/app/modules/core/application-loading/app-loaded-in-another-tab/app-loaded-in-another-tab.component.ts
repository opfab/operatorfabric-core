/* Copyright (c) 2022-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, HostListener,TemplateRef, ViewChild} from '@angular/core';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {LogOption, OpfabLoggerService} from 'app/business/services/logs/opfab-logger.service';
import {UrlLockService} from './url-lock.service';
import {UserService} from 'app/business/services/user.service';
import {ApplicationLoadingStep} from '../application-loading-step';
import {SoundNotificationService} from 'app/business/services/notifications/sound-notification.service';
import {OpfabEventStreamService} from 'app/business/services/opfabEventStream.service';

/** This component checks if the url of opfab is already in use
 *  in the browser (there should not be several accounts connected
 *  at the same time using several tabs in the same browser because it would overwrite
 *  the localStorage and disconnect previous user without any warning)
 *  For more details see https://github.com/opfab/operatorfabric-core/issues/2804
 */

@Component({
    selector: 'of-app-loaded-in-another-tab',
    styleUrls: ['./app-loaded-in-another-tab.component.scss'],
    templateUrl: './app-loaded-in-another-tab.component.html'
})
export class AppLoadedInAnotherTabComponent extends ApplicationLoadingStep {
    @HostListener('window:beforeunload')
    onBeforeUnload() {
        if (this.isApplicationActive) {
            this.logger.info('Set application as unused in storage');
            this.urlLockService.unlockUrl();
        }
    }

    @ViewChild('confirmToContinueLoading') confirmToContinueLoadingTemplate: TemplateRef<any>;
    private confirmToContinueLoadingModal: NgbModalRef;
    public opfabUrl: string;

    public isDisconnectedByAnotherTab = false;
    private isApplicationActive = false;

    constructor(
        private opfabEventStreamService: OpfabEventStreamService,
        private urlLockService: UrlLockService,
        private modalService: NgbModal,
        private logger: OpfabLoggerService,
        private userService: UserService,
        private soundNotificationService: SoundNotificationService
    ) {
        super();
    }

    public execute(): void {
        this.opfabUrl = window.location.href;
        this.checkIfAppLoadedInAnotherTab();
        this.createListenerForDisconnectSignal();
    }

    private checkIfAppLoadedInAnotherTab(): void {
        if (this.urlLockService.isUrlLocked()) {
            this.logger.info('Another browser tab has the application loaded', LogOption.LOCAL_AND_REMOTE);
            this.confirmToContinueLoadingModal = this.modalService.open(this.confirmToContinueLoadingTemplate, {
                centered: true,
                backdrop: 'static'
            });
        } else {
            this.logger.info('No another browser tab has the application loaded', LogOption.LOCAL_AND_REMOTE);
            this.urlLockService.lockUrl();
            this.sendCheckAppLoadedInAnotherTabDone();
        }
    }

    private sendCheckAppLoadedInAnotherTabDone(): void {
        this.isApplicationActive = true;
        this.setStepAsFinishedWithoutError();
    }

    public continueLoadingAndDisconnectOtherUsers(): void {
        this.confirmToContinueLoadingModal.close();
        this.urlLockService.lockUrl();
        this.urlLockService.disconnectOtherUsers();
        // Wait for connection to be closed on the back
        // to avoid having the popup for user already connected
        setTimeout(() => this.sendCheckAppLoadedInAnotherTabDone(), 1000);
    }



    private createListenerForDisconnectSignal(): void {
        this.urlLockService.setDisconnectSignalListener(() => {
            this.isDisconnectedByAnotherTab = true;
            this.isApplicationActive = false;
            this.soundNotificationService.stopService();
            this.opfabEventStreamService.closeEventStream();
            const login = this.userService.getCurrentUserWithPerimeters().userData.login;
            this.logger.info(
                'User ' + login + ' was disconnected by another browser tab having loaded the application',
                LogOption.LOCAL_AND_REMOTE
            );
        });
    }

    public cancelApplicationLoadingBecauseAppIsLoadedInAnotherTab(): void {
        this.confirmToContinueLoadingModal.close();
        this.setStepAsFinishedWithError();
    }
}
