/* Copyright (c) 2018-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, OnInit, Input} from '@angular/core';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {OpfabLoggerService} from 'app/business/services/logs/opfab-logger.service';

@Component({
    selector: 'of-custom-logo',
    templateUrl: './custom-logo.component.html'
})
export class CustomLogoComponent implements OnInit {
    @Input() base64: string;

    @Input() height: number;
    @Input() width: number;

    DEFAULT_HEIGHT = 40;
    DEFAULT_WIDTH = 40;

    MAX_HEIGHT = 48;

    constructor(public domSanitizationService: DomSanitizer, private logger: OpfabLoggerService) {}

    ngOnInit() {
        if (this.base64 == undefined || this.base64 == '') {
            this.logger.error('no custom-logo base64 configured, no picture loaded');
        }
        if (this.height == undefined) this.height = this.DEFAULT_HEIGHT;
        if (this.width == undefined) this.width = this.DEFAULT_WIDTH;
        if (this.height > this.MAX_HEIGHT) {
            this.logger.error('Logo height > 48px in web-ui.json, height will be set to 48px ');
            this.height = this.MAX_HEIGHT;
        }
    }

    public getImage(): SafeUrl {
        return this.domSanitizationService.bypassSecurityTrustUrl(this.base64);
    }
}
