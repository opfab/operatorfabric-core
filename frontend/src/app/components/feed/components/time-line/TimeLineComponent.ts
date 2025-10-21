/* Copyright (c) 2018-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */
import {Component, ViewChild} from '@angular/core';
import {TimelineButtonsComponent} from '../../../share/timeline-buttons/TimelineButtonsComponent';
import {CustomTimelineChartComponent} from './custom-timeline-chart/CustomTimeLineChartComponent';
import {PinnedCardsComponent} from '../pinned-cards/PinnedCardsComponent';
import {NgIf} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';

@Component({
    selector: 'of-time-line',
    templateUrl: './TimeLineComponent.html',
    styleUrls: ['./TimeLineComponent.scss'],
    imports: [TimelineButtonsComponent, CustomTimelineChartComponent, PinnedCardsComponent, NgIf, TranslateModule]
})
export class TimeLineComponent {
    @ViewChild('timelineButtons')
    timelineButtons: TimelineButtonsComponent;
}
