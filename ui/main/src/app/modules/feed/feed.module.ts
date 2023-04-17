/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CardListComponent} from './components/card-list/card-list.component';
import {FeedComponent} from './feed.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FeedRoutingModule} from './feed-routing.module';
import {TimeLineComponent} from './components/time-line/time-line.component';
import {CardModule} from '../card/card.module';
import {FiltersComponent} from './components/card-list/filters/filters.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {TranslateModule} from '@ngx-translate/core';
import {ChartCommonModule, NgxChartsModule} from '@swimlane/ngx-charts';
import {CustomTimelineChartComponent} from './components/time-line/custom-timeline-chart/custom-timeline-chart.component';
import {MouseWheelDirective} from './components/time-line/directives/mouse-wheel.directive';
import {InitChartComponent} from './components/time-line/init-chart/init-chart.component';
import {DatetimeFilterModule} from '../../modules/share/datetime-filter/datetime-filter.module';
import {FeedSortComponent} from './components/card-list/filters/feed-sort/feed-sort.component';
import {LightCardModule} from 'app/modules/share/light-card/light-card.module';
import {TimelineButtonsModule} from '../share/timeline-buttons/timeline-buttons.module';
import {PinnedCardsComponent} from './components/pinned-cards/pinned-cards.component';
import {MapComponent} from './components/map/map.component';
import {FeedSearchComponent} from './components/card-list/filters/feed-search/feed-search.component';
import {FeedFilterComponent} from './components/card-list/filters/feed-filter/feed-filter.component';
import {FeedFilterAndSortIconsComponent} from './components/card-list/filters/feed-filter-and-sort-icons/feed-filter-and-sort-icons.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgxChartsModule,
        ChartCommonModule,
        ReactiveFormsModule,
        TranslateModule,
        NgbModule,
        CardModule,
        DatetimeFilterModule,
        FeedRoutingModule,
        LightCardModule,
        TimelineButtonsModule
    ],
    declarations: [
        CardListComponent,
        FeedComponent,
        TimeLineComponent,
        FiltersComponent,
        FeedFilterComponent,
        InitChartComponent,
        CustomTimelineChartComponent,
        MouseWheelDirective,
        FeedSortComponent,
        PinnedCardsComponent,
        MapComponent,
        FeedSearchComponent,
        FeedFilterAndSortIconsComponent
    ],
    exports: [FeedComponent]
})
export class FeedModule {}
