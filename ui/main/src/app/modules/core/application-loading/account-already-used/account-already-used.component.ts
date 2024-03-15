/* Copyright (c) 2022-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {ChangeDetectionStrategy, Component, Input, TemplateRef, ViewChild} from '@angular/core';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {LogOption, LoggerService as logger} from 'app/business/services/logs/logger.service';
import {UserService} from 'app/business/services/users/user.service';
import {ApplicationLoadingComponent} from '../../../../business/application-loading-component';
import {SessionManagerService} from 'app/business/services/session-manager.service';

@Component({
    selector: 'of-account-already-used',
    templateUrl: './account-already-used.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountAlreadyUsedComponent extends ApplicationLoadingComponent {
    @Input() public userLogin: string;

    @ViewChild('sessionAlreadyInUse') sessionAlreadyInUsePopupRef: TemplateRef<any>;

    private questionModal: NgbModalRef;

    constructor(private modalService: NgbModal) {
        super();
    }

    public execute() {
        UserService.willNewSubscriptionDisconnectAnExistingSubscription().subscribe((isUserAlreadyConnected) => {
            if (isUserAlreadyConnected) {
                logger.info('Login ' + this.userLogin + ' is already connected', LogOption.LOCAL_AND_REMOTE);
                this.questionModal = this.modalService.open(this.sessionAlreadyInUsePopupRef, {
                    centered: true,
                    backdrop: 'static'
                });
            } else {
                logger.info('Login ' + this.userLogin + ' is not already used ', LogOption.LOCAL_AND_REMOTE);
                this.sendEventAccountAlreadyInUseCheckDone();
            }
        });
        return super.execute();
    }

    public loginEvenIfAccountIsAlreadyUsed(): void {
        logger.info('Login as ' + this.userLogin + ' even if account is already used ', LogOption.REMOTE);
        this.questionModal.close();
        this.sendEventAccountAlreadyInUseCheckDone();
    }

    public logoutBecauseAccountIsAlreadyUsed() {
        logger.info('Logout with user ' + this.userLogin + ' because account already used ', LogOption.REMOTE);
        this.questionModal.close();
        SessionManagerService.logout();
    }

    private sendEventAccountAlreadyInUseCheckDone() {
        this.setAsFinishedWithoutError();
    }
}
