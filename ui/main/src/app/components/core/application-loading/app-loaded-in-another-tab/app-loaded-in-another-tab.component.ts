/* Copyright (c) 2022-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, HostListener, TemplateRef, ViewChild} from '@angular/core';
import {LogOption, LoggerService as logger} from 'app/services/logs/LoggerService';
import {UrlLockService} from './url-lock.service';
import {UsersService} from '@ofServices/users/UsersService';
import {ApplicationLoadingComponent} from '../../../../business/application-loading-component';
import {SoundNotificationService} from '@ofServices/notifications/SoundNotificationService';
import {OpfabEventStreamService} from '@ofServices/events/OpfabEventStreamService';
import {ModalService} from '../../../../services/modal/ModalService';
import {I18n} from '@ofModel/i18n.model';
import {NgIf} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';

/** This component checks if the url of opfab is already in use
 *  in the browser (there should not be several accounts connected
 *  at the same time using several tabs in the same browser because it would overwrite
 *  the localStorage and disconnect previous user without any warning)
 *  For more details see https://github.com/opfab/operatorfabric-core/issues/2804
 */

@Component({
    selector: 'of-app-loaded-in-another-tab',
    styleUrls: ['./app-loaded-in-another-tab.component.scss'],
    templateUrl: './app-loaded-in-another-tab.component.html',
    standalone: true,
    imports: [NgIf, TranslateModule]
})
export class AppLoadedInAnotherTabComponent extends ApplicationLoadingComponent {
    @HostListener('window:beforeunload')
    onBeforeUnload() {
        if (this.isApplicationActive) {
            logger.info('Set application as unused in storage');
            this.urlLockService.unlockUrl();
        }
    }

    @ViewChild('confirmToContinueLoading') confirmToContinueLoadingTemplate: TemplateRef<any>;

    public opfabUrl: string;

    public isDisconnectedByAnotherTab = false;
    private isApplicationActive = false;

    constructor(private readonly urlLockService: UrlLockService) {
        super();
    }

    public async execute(): Promise<boolean> {
        this.opfabUrl = window.location.href;
        setTimeout(() => this.checkIfAppLoadedInAnotherTab(), 0);
        this.createListenerForDisconnectSignal();
        return super.execute();
    }

    private checkIfAppLoadedInAnotherTab(): void {
        if (this.urlLockService.isUrlLocked()) {
            logger.info('Another browser tab has the application loaded', LogOption.LOCAL_AND_REMOTE);
            ModalService.openConfirmationModal(
                undefined,
                new I18n('login.confirmationBecauseAppAlreadyLoadedInAnotherTab', {url: this.opfabUrl})
            ).then((confirmed) => {
                if (confirmed) {
                    this.continueLoadingAndDisconnectOtherUsers();
                } else {
                    this.cancelApplicationLoadingBecauseAppIsLoadedInAnotherTab();
                }
            });
        } else {
            logger.info('No another browser tab has the application loaded', LogOption.LOCAL_AND_REMOTE);
            this.urlLockService.lockUrl();
            this.sendCheckAppLoadedInAnotherTabDone();
        }
    }

    private sendCheckAppLoadedInAnotherTabDone(): void {
        this.isApplicationActive = true;
        this.setAsFinishedWithoutError();
    }

    public continueLoadingAndDisconnectOtherUsers(): void {
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
            SoundNotificationService.stopService();
            OpfabEventStreamService.closeEventStream();
            const login = UsersService.getCurrentUserWithPerimeters().userData.login;
            logger.info(
                'User ' + login + ' was disconnected by another browser tab having loaded the application',
                LogOption.LOCAL_AND_REMOTE
            );
        });
    }

    public cancelApplicationLoadingBecauseAppIsLoadedInAnotherTab(): void {
        this.setAsFinishedWithError();
    }
}
