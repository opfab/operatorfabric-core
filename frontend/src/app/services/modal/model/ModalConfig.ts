/* Copyright (c) 2024-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {I18n} from 'app/model/I18n';

export class ModalConfig {
    public readonly title?: string | I18n;
    public readonly message?: string | I18n;
    public readonly buttons?: ModalButton[];
}

export class ModalButton {
    public readonly id: string;
    public readonly label: string | I18n;
    public readonly isSelected?: boolean = true;
}
