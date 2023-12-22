/* Copyright (c) 2022-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

export class MultiSelectOption {
    public value: string;
    public label: string;
    public options: Array<MultiSelectOption>;

    public constructor(value: string, label: string) {
        this.value = value;
        this.label = label;
    }
}
export class MultiSelectConfig {
    public labelKey: string;
    public placeholderKey?: string;
    public sortOptions?: boolean;
    public nbOfDisplayValues?: number;
    public multiple?: boolean;
    public search?: boolean;
    public allowNewOption?: boolean;
    public autoSelectFirstOption?: boolean;
}
export class MultiSelect {
    public id: string;
    public config: MultiSelectConfig;
    public options: Array<MultiSelectOption>;
    public selectedOptions: Array<string>;
}
