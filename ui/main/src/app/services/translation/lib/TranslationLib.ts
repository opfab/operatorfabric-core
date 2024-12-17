/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 18* License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

export abstract class TranslationLib {
    abstract getTranslation(key: string, params?: Object): string;
    abstract setLang(lang: string);
    abstract setTranslation(lang: string, translation: Object, shouldMerge: boolean);
}
