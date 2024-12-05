/* Copyright (c) 2020, RTEi (http://www.rte-international.com)
 * Copyright (c) 2021-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {TranslateService, TranslateModule} from '@ngx-translate/core';
import {SharingService} from './services/sharing.service';
import {NgFor} from '@angular/common';
import {FormsModule} from '@angular/forms';

@Component({
    selector: 'of-admin',
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [RouterLink, RouterLinkActive, TranslateModule, RouterOutlet, NgFor, FormsModule]
})
export class AdminComponent implements OnInit {
    public paginationDefaultPageSize = 10;
    public paginationPageSizeOptions = [5, 10, 25, 50, 100];

    constructor(
        protected translate: TranslateService,
        private readonly dataHandlingService: SharingService
    ) {}

    ngOnInit() {
        this.dataHandlingService.changePaginationPageSize(this.paginationDefaultPageSize);
    }

    onPageSizeChanged() {
        // Cast to get rid of "Property 'value' does not exist on type 'HTMLElement'."
        const value = (<HTMLInputElement>document.getElementById('opfab-page-size-select')).value;
        this.dataHandlingService.changePaginationPageSize(Number(value));
    }
}
