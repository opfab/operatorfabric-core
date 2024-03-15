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
import {ModalServer} from 'app/business/server/modal.server';
import {OpfabNgbModalComponent} from '../modules/share/modal/opfabNgbModal.component';
import {ModalConfig} from '@ofModel/modal-config.model';

@Injectable({
    providedIn: 'root'
})
export class NgbModalServer implements ModalServer {
    constructor(private modalService: NgbModal) {}

    openModal(modalConfig: ModalConfig): Promise<string> {
        const modalRef = this.modalService.open(OpfabNgbModalComponent, {centered: true});
        modalRef.componentInstance.modalConfig = modalConfig;
        return modalRef.result;
    }
}
