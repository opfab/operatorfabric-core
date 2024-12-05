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
import {I18n} from '@ofModel/i18n.model';
import {NgIf, NgClass, NgFor} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';

@Component({
    selector: 'of-ngb-modal',
    templateUrl: './opfabNgbModal.component.html',
    styleUrls: ['./opfabNgbModal.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgIf, NgClass, NgFor, TranslateModule]
})
export class OpfabNgbModalComponent {
    @Input() modalConfig: ModalConfig;

    constructor(private readonly activeModal: NgbActiveModal) {}

    public close(buttonId: string) {
        this.activeModal.close(buttonId);
    }

    protected isI18n(val: string | I18n): boolean {
        return val instanceof I18n;
    }
}
