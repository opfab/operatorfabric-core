/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {I18n} from '@ofModel/i18n.model';
import {ModalServer} from '../server/modal.server';
import {ModalConfig} from '@ofModel/modal-config.model';

export class ModalService {
    private static modalServer: ModalServer;

    public static setModalServer(modalServer: ModalServer) {
        ModalService.modalServer = modalServer;
    }

    public static openInformationModal(message: string | I18n): Promise<void> {
        const modalConfig: ModalConfig = {
            title: undefined,
            message: message,
            buttons: [
                {
                    label: new I18n('button.ok'),
                    id: 'ok',
                    isSelected: true
                }
            ]
        };
        return this.modalServer
            .openModal(modalConfig)
            .then(() => undefined)
            .catch(() => undefined); // in case of modal closed via Esc key
    }

    public static openConfirmationModal(title: string | I18n, message: string | I18n): Promise<boolean> {
        const modalConfig: ModalConfig = {
            title: title,
            message: message,
            buttons: [
                {
                    label: new I18n('button.cancel'),
                    id: 'cancel'
                },
                {
                    label: new I18n('button.ok'),
                    id: 'ok',
                    isSelected: true
                }
            ]
        };
        return this.modalServer
            .openModal(modalConfig)
            .then((result) => result === 'ok')
            .catch(() => false); // in case of modal closed via Esc key
    }

    public static openSaveBeforeExitModal(): Promise<string> {
        const modalConfig: ModalConfig = {
            title: new I18n('shared.popup.title'),
            message: new I18n('notificationConfiguration.modificationToSave'),
            buttons: [
                {
                    label: new I18n('button.doNotSave'),
                    id: 'doNotSave'
                },
                {
                    label: new I18n('button.cancel'),
                    id: 'cancel'
                },
                {
                    label: new I18n('button.save'),
                    id: 'save',
                    isSelected: true
                }
            ]
        };
        return this.modalServer
            .openModal(modalConfig)
            .then((result) => result)
            .catch(() => 'cancel'); // in case of modal closed via Esc key
    }
}
