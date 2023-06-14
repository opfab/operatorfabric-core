/* Copyright (c) 2023, Alliander (http://www.alliander.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, OnDestroy, OnInit} from "@angular/core";

@Component({
    selector: 'of-loading-in-progress',
    templateUrl: './loading-in-progress.html'
})
export class LoadingInProgress implements OnInit, OnDestroy{

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
