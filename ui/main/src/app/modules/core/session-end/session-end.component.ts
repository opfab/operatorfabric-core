/* Copyright (c) 2022-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {I18n} from '@ofModel/i18n.model';
import {ModalService} from '@ofServices/modal/ModalService';
import {SessionManagerService} from '@ofServices/sessionManager/SessionManagerService';
import {NgIf} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';

@Component({
    selector: 'of-session-end',
    styleUrls: ['./session-end.component.scss'],
    templateUrl: './session-end.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgIf, TranslateModule]
})
export class SessionEndComponent implements OnInit {
    public isDisconnectedByNewUser = false;

    constructor(private readonly changeDetector: ChangeDetectorRef) {}

    ngOnInit(): void {
        this.subscribeToSessionEnd();
    }

    private subscribeToSessionEnd() {
        SessionManagerService.getEndSessionEvent().subscribe((event) => {
            if (event === 'DisconnectedByNewUser') {
                this.isDisconnectedByNewUser = true;
                this.changeDetector.markForCheck();
            } else {
                ModalService.openInformationModal(new I18n('global.sessionExpiredText')).then(() => {
                    SessionManagerService.logout();
                });
            }
        });
    }
}
