/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component} from '@angular/core';
import {ConfigService} from 'app/business/services/config.service';
import {AboutView} from 'app/business/view/core/about/about.view';



@Component({
    selector: 'of-about',
    styleUrls: ['./about.component.scss'],
    templateUrl: './about.component.html'
})
export class AboutComponent {
    aboutElements = [];

    constructor(configService: ConfigService) {
        const aboutView = new AboutView(configService);
        this.aboutElements = aboutView.getAboutElements();
    }
}
