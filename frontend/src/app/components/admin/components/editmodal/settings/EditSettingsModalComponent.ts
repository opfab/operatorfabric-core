/* Copyright (c) 2026, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {ChangeDetectionStrategy, Component, Input, inject} from '@angular/core';
import {User} from '@ofServices/users/model/User';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {provideTranslateService} from '@ngx-translate/core';
import {SettingsComponent} from 'app/components/settings/SettingsComponent';

@Component({
    selector: 'of-edit-settings-modal',
    templateUrl: './EditSettingsModalComponent.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [SettingsComponent],
    providers: [provideTranslateService()]
})
export class EditSettingsModalComponent {
    private readonly activeModal = inject(NgbActiveModal);

    @Input() row: User;

    dismissModal(reason: string): void {
        this.activeModal.dismiss(reason);
    }
}
