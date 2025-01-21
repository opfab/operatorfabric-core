/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {ChangeDetectionStrategy, Component, OnDestroy, OnInit} from '@angular/core';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {ExternalAppIFrameView} from 'app/views/externalAppIframe/externalAppIFrame.view';

@Component({
    selector: 'of-iframedisplay',
    templateUrl: './external-app-iframe.component.html',
    styleUrls: ['./external-app-iframe.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true
})
export class ExternalAppIFrameComponent implements OnInit, OnDestroy {
    unsubscribe$: Subject<void> = new Subject<void>();
    private externalAppIFrameView: ExternalAppIFrameView;

    ngOnInit() {
        this.externalAppIFrameView = new ExternalAppIFrameView();
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
