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
import {TranslationService} from './translation/translation.service';
import {ModalConfig} from '@ofModel/modal-config.model';

export class ModalService {
    private static modalServer: ModalServer;
    private static translationService: TranslationService;

    public static setModalServer(modalServer: ModalServer) {
        ModalService.modalServer = modalServer;
    }

    public static setTranslationService(translationService: TranslationService) {
        ModalService.translationService = translationService;
    }

    public static openInformationModal(message: string | I18n): Promise<void> {
        const messageTranslated = this.getTranslatedValue(message);

        const modalConfig: ModalConfig = {
            title: undefined,
            message: messageTranslated,
            buttons: [
                {
                    label: this.translationService.getTranslation('button.ok'),
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

    private static getTranslatedValue(value: string | I18n): string {
        if (value instanceof I18n) {
            return this.translationService.getTranslation(value.key, value.parameters);
        }
        return value;
    }

    public static openConfirmationModal(title: string | I18n, message: string | I18n): Promise<boolean> {
        const titleTranslated = this.getTranslatedValue(title);
        const messageTranslated = this.getTranslatedValue(message);

        const modalConfig: ModalConfig = {
            title: titleTranslated,
            message: messageTranslated,
            buttons: [
                {
                    label: this.translationService.getTranslation('button.cancel'),
                    id: 'cancel'
                },
                {
                    label: this.translationService.getTranslation('button.ok'),
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
            title: this.translationService.getTranslation('shared.popup.title'),
            message: this.translationService.getTranslation('notificationConfiguration.modificationToSave'),
            buttons: [
                {
                    label: this.translationService.getTranslation('button.doNotSave'),
                    id: 'doNotSave'
                },
                {
                    label: this.translationService.getTranslation('button.cancel'),
                    id: 'cancel'
                },
                {
                    label: this.translationService.getTranslation('button.save'),
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
