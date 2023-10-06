/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, OnDestroy, OnInit} from '@angular/core';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {GlobalStyleService} from 'app/business/services/global-style.service';
import {ConfigService} from 'app/business/services/config.service';
import {ExternalAppIFrameView} from 'app/business/view/externalAppIframe/externalAppIFrame.view';

@Component({
    selector: 'of-iframedisplay',
    templateUrl: './external-app-iframe.component.html',
    styleUrls: ['./external-app-iframe.component.scss']
})
export class ExternalAppIFrameComponent implements OnInit, OnDestroy {
    unsubscribe$: Subject<void> = new Subject<void>();
    private externalAppIFrameView: ExternalAppIFrameView;

    constructor(
        private configService: ConfigService,
        private globalStyleService: GlobalStyleService,
    ) {}

    ngOnInit() {
        this.externalAppIFrameView = new ExternalAppIFrameView(
            this.configService,
            this.globalStyleService
        );
        this.externalAppIFrameView
            .getExternalAppUrl()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((url) => {
                document.getElementById('opfab-externalApp-iframe').setAttribute('src', url);
            });
    }

    ngOnDestroy() {
        this.externalAppIFrameView.destroy();
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
