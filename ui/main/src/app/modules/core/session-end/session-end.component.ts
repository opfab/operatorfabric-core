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
import {SessionManagerService} from 'app/business/services/session-manager.service';

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

    constructor(private sessionManager: SessionManagerService, private modalService: NgbModal) {}

    ngOnInit(): void {
        this.subscribeToSessionEnd();
    }

    private subscribeToSessionEnd() {
        this.sessionManager.getEndSessionEvent().subscribe((event) => {
            if (event === 'DisconnectedByNewUser') {
                this.isDisconnectedByNewUser = true;
            } else {
                this.modalRef = this.modalService.open(this.sessionEndPopupRef, {
                    centered: true,
                    backdrop: 'static',
                    backdropClass: 'opfab-session-end-modal',
                    windowClass: 'opfab-session-end-modal'
                });
            }
        });
    }

    public logout() {
        this.modalRef.close();
        this.sessionManager.logout();
    }
}
