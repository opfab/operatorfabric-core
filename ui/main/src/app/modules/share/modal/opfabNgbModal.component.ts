/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {ModalConfig} from '@ofModel/modal-config.model';

@Component({
    selector: 'of-ngb-modal',
    templateUrl: './opfabNgbModal.component.html',
    styleUrls: ['./opfabNgbModal.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OpfabNgbModalComponent {
    @Input() modalConfig: ModalConfig;

    constructor(private activeModal: NgbActiveModal) {}

    public close(buttonId: string) {
        this.activeModal.close(buttonId);
    }
}
