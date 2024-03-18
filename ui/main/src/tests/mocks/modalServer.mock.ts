/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {ModalConfig} from '@ofModel/modal-config.model';
import {ModalServer} from 'app/business/server/modal.server';

export class ModalServerMock implements ModalServer {
    private responseForOpenModal: string = '';
    public modalConfigReceived: ModalConfig;
    private resolveClickOnButton: (value: string) => void;

    public setResponseForOpenModal(response: string) {
        this.responseForOpenModal = response;
    }

    async openModal(modalConfig: ModalConfig): Promise<string> {
        this.modalConfigReceived = modalConfig;
        return new Promise<string>((resolve) => {
            this.resolveClickOnButton = resolve;
        });
    }

    public clickOnButton(buttonId: string): void {
        this.resolveClickOnButton(buttonId);
    }

    public isOpenedModalOfInformationType(): boolean {
        if (this.modalConfigReceived.title != null) return false;
        if (this.modalConfigReceived.buttons.length !== 1) return false;
        if (!this.modalConfigReceived.buttons[0].label.includes('button.ok')) return false;
        return true;
    }
}
