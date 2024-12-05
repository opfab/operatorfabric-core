/* Copyright (c) 2021-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {ConfigService} from 'app/business/services/config.service';

@Component({
    selector: 'of-changepassword',
    templateUrl: './changepassword.component.html',
    styleUrls: ['./changepassword.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true
})
export class ChangepasswordComponent implements OnInit {
    public changePasswordUrl: SafeUrl;

    constructor(private readonly sanitizer: DomSanitizer) {}

    ngOnInit() {
        this.changePasswordUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
            ConfigService.getConfigValue('security.changePasswordUrl')
        );
    }
}
