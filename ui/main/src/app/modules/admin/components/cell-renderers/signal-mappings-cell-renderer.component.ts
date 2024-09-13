/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {ChangeDetectionStrategy, Component} from '@angular/core';
import {ICellRendererAngularComp} from 'ag-grid-angular';
import {ICellRendererParams} from 'ag-grid-community';
import {TranslateModule} from '@ngx-translate/core';

@Component({
    selector: 'of-signal-mappings-cell-renderer',
    templateUrl: './signal-mappings-cell-renderer.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [TranslateModule]
})
export class SignalMappingsCellRendererComponent implements ICellRendererAngularComp {
    supportedSignals: Map<string, number>;

    agInit(params: any): void {
        this.supportedSignals = params.getValue();
    }

    refresh(params: ICellRendererParams): boolean {
        return true;
    }

    getMapping(severity): number {
        return this.supportedSignals[severity];
    }
}
