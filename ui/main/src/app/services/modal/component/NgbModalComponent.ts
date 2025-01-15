/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Injectable} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ModalComponent} from '@ofServices/modal/component/ModalComponent';
import {OpfabNgbModalComponent} from '../../../components/share/modal/opfabNgbModal.component';
import {ModalConfig} from '@ofServices/modal/model/ModalConfig';

@Injectable({
    providedIn: 'root'
})
export class NgbModalComponent implements ModalComponent {
    constructor(private readonly modalService: NgbModal) {}

    openModal(modalConfig: ModalConfig): Promise<string> {
        const modalRef = this.modalService.open(OpfabNgbModalComponent, {centered: true});
        modalRef.componentInstance.modalConfig = modalConfig;
        return modalRef.result;
    }
}
