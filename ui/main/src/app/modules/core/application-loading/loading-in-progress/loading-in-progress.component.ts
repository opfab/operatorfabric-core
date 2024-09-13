/* Copyright (c) 2023, Alliander (http://www.alliander.com)
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, OnDestroy, OnInit} from '@angular/core';
import {SpinnerComponent} from '../../../share/spinner/spinner.component';
import {NgIf} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';

@Component({
    selector: 'of-loading-in-progress',
    templateUrl: './loading-in-progress.component.html',
    standalone: true,
    imports: [SpinnerComponent, NgIf, TranslateModule]
})
export class LoadingInProgressComponent implements OnInit, OnDestroy {
    showReloadButton = false;
    reloadTimeout: any;

    ngOnInit() {
        this.waitForReloadButtonToDisplay();
    }

    private waitForReloadButtonToDisplay() {
        this.reloadTimeout = setTimeout(() => {
            this.showReloadButton = true;
        }, 10000);
    }

    reloadPage() {
        window.location.reload();
    }

    ngOnDestroy() {
        clearTimeout(this.reloadTimeout);
    }
}
