/* Copyright (c) 2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */
import {NgIf} from '@angular/common';
import {Component} from '@angular/core';

import type {ITooltipAngularComp} from 'ag-grid-angular';

@Component({
    standalone: true,
    template: `
        <span *ngIf="plainText"> {{ value }}</span>
        <span *ngIf="!plainText" [innerHTML]="value"></span>
    `,
    styles: [
        `
            :host {
                background-color: var(--opfab-popover-bgcolor);
                color: var(--opfab-text-color);
                border-radius: 6px;
                border: 1px solid var(--opfab-tooltip-template-border-color);
                padding: 10px;
                font-size: 16px;
            }
        `
    ],
    imports: [NgIf]
})
export class CustomTooltipComponent implements ITooltipAngularComp {
    value: any;
    plainText = true;
    agInit(params): void {
        this.plainText = params.colDef.type !== 'html';
        if (this.plainText) {
            this.value = params.value;
        } else {
            this.value = params.value.htmlValue;
        }
    }
}
