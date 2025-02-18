/* Copyright (c) 2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {NgIf} from '@angular/common';
import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Subject, takeUntil} from 'rxjs';
import {CustomCardListComponent} from './CustomCardListComponent';

@Component({
    selector: 'of-custom-screen',
    templateUrl: './CustomScreenComponent.html',
    standalone: true,
    imports: [NgIf, CustomCardListComponent]
})
export class CustomScreenComponent implements OnInit, OnDestroy {
    customScreenId: string;
    displayComponent = false;

    private readonly ngUnsubscribe$ = new Subject<void>();

    constructor(private readonly route: ActivatedRoute) {}

    ngOnInit(): void {
        this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe$)).subscribe((params) => {
            this.customScreenId = params.get('id');

            // the following hack is needed to have the CustomCardListComponent
            // destroyed and recreated when the route changes
            this.displayComponent = false;
            setTimeout(() => {
                this.displayComponent = true;
            });
        });
    }

    ngOnDestroy(): void {
        this.ngUnsubscribe$.next();
        this.ngUnsubscribe$.complete();
    }
}
