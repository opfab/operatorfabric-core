/* Copyright (c) 2022-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component} from '@angular/core';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';

@Component({
    selector: 'of-externaldevices',
    templateUrl: './externaldevicesconfiguration.component.html',
    styleUrls: ['./externaldevicesconfiguration.component.scss'],
    standalone: true,
    imports: [RouterLink, RouterLinkActive, TranslateModule, RouterOutlet]
})
export class ExternaldevicesconfigurationComponent {}
