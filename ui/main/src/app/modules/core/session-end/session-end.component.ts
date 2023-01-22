/* Copyright (c) 2022-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, OnInit, TemplateRef, ViewChild, ViewEncapsulation} from '@angular/core';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {Actions, ofType} from '@ngrx/effects';
import {Action, Store} from '@ngrx/store';
import {LogOption, OpfabLoggerService} from '@ofServices/logs/opfab-logger.service';
import {SoundNotificationService} from '@ofServices/sound-notification.service';
import {AuthenticationActionTypes, TryToLogOutAction} from '@ofStore/actions/authentication.actions';
import {OpfabEventStreamService} from 'app/business/services/opfabEventStream.service';

@Component({
    selector: 'of-session-end',
    styleUrls: ['./session-end.component.scss'],
    encapsulation: ViewEncapsulation.None,
    templateUrl: './session-end.component.html'
})
export class SessionEndComponent implements OnInit {
    public isDisconnectedByNewUser = false;
    private modalRef: NgbModalRef;
    @ViewChild('sessionEnd') sessionEndPopupRef: TemplateRef<any>;

    constructor(
        private store: Store,
        private opfabEventStreamService : OpfabEventStreamService,
        private soundNotificationService: SoundNotificationService,
        private actions$: Actions,
        private modalService: NgbModal,
        private logger: OpfabLoggerService
    ) {}

    ngOnInit(): void {
        this.subscribeToSessionEnd();
        this.subscribeToSessionClosedByNewUser();
    }

    private subscribeToSessionEnd() {
        this.actions$.pipe(ofType<Action>(AuthenticationActionTypes.SessionExpired)).subscribe(() => {
            this.logger.info('Session expire ', LogOption.REMOTE);
            this.soundNotificationService.handleSessionEnd();
            this.opfabEventStreamService.closeEventStream();
            this.modalRef = this.modalService.open(this.sessionEndPopupRef, {
                centered: true,
                backdrop: 'static',
                backdropClass: 'opfab-session-end-modal',
                windowClass: 'opfab-session-end-modal'
            });
        });
    }

    private subscribeToSessionClosedByNewUser() {
        this.opfabEventStreamService.getReceivedDisconnectUser().subscribe((isDisconnected) => {
            this.isDisconnectedByNewUser = isDisconnected;

            if (isDisconnected) {
                this.soundNotificationService.clearOutstandingNotifications();
            }
        });
    }

    public logout() {
        this.logger.info('Logout ', LogOption.REMOTE);
        this.modalRef.close();
        this.store.dispatch(new TryToLogOutAction());
    }
}
