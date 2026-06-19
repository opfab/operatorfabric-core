/* Copyright (c) 2024-2026, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {ChangeDetectionStrategy, Component, Input, inject} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {ModalConfig} from '@ofServices/modal/model/ModalConfig';
import {I18n} from 'app/model/I18n';
import {NgClass} from '@angular/common';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
    selector: 'of-ngb-modal',
    templateUrl: './OpfabNgbModalComponent.html',
    styleUrls: ['./OpfabNgbModalComponent.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgClass, TranslatePipe]
})
export class OpfabNgbModalComponent {
    private readonly activeModal = inject(NgbActiveModal);

    @Input() modalConfig: ModalConfig;

    public close(buttonId: string) {
        this.activeModal.close(buttonId);
    }

    protected isI18n(val: string | I18n): boolean {
        return val instanceof I18n;
    }
}
