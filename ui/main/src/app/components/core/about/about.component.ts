/* Copyright (c) 2018-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {NgFor} from '@angular/common';
import {ChangeDetectionStrategy, Component} from '@angular/core';
import {AboutView} from 'app/views/core/about/AboutView';

@Component({
    selector: 'of-about',
    styleUrls: ['./about.component.scss'],
    templateUrl: './about.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgFor],
    standalone: true
})
export class AboutComponent {
    aboutElements = [];

    constructor() {
        const aboutView = new AboutView();
        this.aboutElements = aboutView.getAboutElements();
    }
}
