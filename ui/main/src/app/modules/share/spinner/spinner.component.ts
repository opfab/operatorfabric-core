/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'of-spinner',
    templateUrl: './spinner.component.html',
    styleUrls: ['./spinner.component.scss']
})
export class SpinnerComponent implements OnInit, OnDestroy {
    @Input() loadingText = "shared.loadingInProgress";
    @Input() timeBeforeDisplayingSpinner = 500;

    mustDisplaySpinner = false;
    private interval;

    constructor(protected translate: TranslateService) {}

    ngOnInit() {
        this.interval = setInterval(() => {
            this.mustDisplaySpinner = true;
        }, this.timeBeforeDisplayingSpinner);
    }

    ngOnDestroy() {
        clearInterval(this.interval);
    }

    getTranslation(stringToTranslate: string): string {
        return this.translate.instant(stringToTranslate);
    }
}
