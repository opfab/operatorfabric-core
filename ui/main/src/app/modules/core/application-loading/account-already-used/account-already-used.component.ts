/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, Input, TemplateRef, ViewChild} from '@angular/core';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {Store} from '@ngrx/store';
import {LogOption, OpfabLoggerService} from '@ofServices/logs/opfab-logger.service';
import {UserService} from '@ofServices/user.service';
import {TryToLogOutAction} from '@ofStore/actions/authentication.actions';
import {ApplicationLoadingStep} from '../application-loading-step';

@Component({
    selector: 'of-account-already-used',
    templateUrl: './account-already-used.component.html'
})
export class AccountAlreadyUsedComponent extends ApplicationLoadingStep {
    @Input() public userLogin: string;

    @ViewChild('sessionAlreadyInUse') sessionAlreadyInUsePopupRef: TemplateRef<any>;

    private questionModal: NgbModalRef;

    public isDisconnectedByUserWithSameUrl = false;

    constructor(
        private store: Store,
        private userService: UserService,
        private modalService: NgbModal,
        private logger: OpfabLoggerService
    ) {
        super();
    }

    public execute() {
        this.userService.willNewSubscriptionDisconnectAnExistingSubscription().subscribe((isUserAlreadyConnected) => {
            if (isUserAlreadyConnected) {
                this.logger.info('Login ' + this.userLogin + ' is already connected', LogOption.LOCAL_AND_REMOTE);
                this.questionModal = this.modalService.open(this.sessionAlreadyInUsePopupRef, {
                    centered: true,
                    backdrop: 'static'
                });
            } else {
                this.logger.info('Login ' + this.userLogin + ' is not already used ', LogOption.LOCAL_AND_REMOTE);
                this.isDisconnectedByUserWithSameUrl = true;
                this.sendEventAccountAlreadyInUseCheckDone();
            }
        });
    }

    public loginEvenIfAccountIsAlreadyUsed(): void {
        this.logger.info('Login as ' + this.userLogin + ' even if account is already used ', LogOption.REMOTE);
        this.questionModal.close();
        this.sendEventAccountAlreadyInUseCheckDone();
    }

    public logoutBecauseAccountIsAlreadyUsed() {
        this.logger.info('Logout with user ' + this.userLogin + ' because account already used ', LogOption.REMOTE);
        this.questionModal.close();
        this.store.dispatch(new TryToLogOutAction());
    }

    private sendEventAccountAlreadyInUseCheckDone() {
        this.setStepAsFinishedWithoutError();
    }
}
