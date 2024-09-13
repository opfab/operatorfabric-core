/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */
import {Component, ViewChild} from '@angular/core';
import {TimelineButtonsComponent} from '../../../share/timeline-buttons/timeline-buttons.component';
import {CustomTimelineChartComponent} from './custom-timeline-chart/custom-timeline-chart.component';
import {PinnedCardsComponent} from '../pinned-cards/pinned-cards.component';
import {NgIf} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';

@Component({
    selector: 'of-time-line',
    templateUrl: './time-line.component.html',
    styleUrls: ['./time-line.component.scss'],
    standalone: true,
    imports: [TimelineButtonsComponent, CustomTimelineChartComponent, PinnedCardsComponent, NgIf, TranslateModule]
})
export class TimeLineComponent {
    @ViewChild('timelineButtons')
    timelineButtons: TimelineButtonsComponent;
}
