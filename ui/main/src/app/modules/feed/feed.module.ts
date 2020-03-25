/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CardListComponent} from './components/card-list/card-list.component';
import {FeedComponent} from './feed.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FeedRoutingModule} from "./feed-routing.module";
import {NoSelectionComponent} from './components/no-selection/no-selection.component';
import {TimeLineComponent} from './components/time-line/time-line.component';
import {CardsModule} from "../cards/cards.module";
import {FiltersComponent} from './components/card-list/filters/filters.component';
import {TypeFilterComponent} from './components/card-list/filters/type-filter/type-filter.component';
import {NgbModule} from "@ng-bootstrap/ng-bootstrap";
import {TranslateModule} from "@ngx-translate/core";
import {TimeFilterComponent} from './components/card-list/filters/time-filter/time-filter.component';
import {ChartCommonModule, NgxChartsModule} from "@swimlane/ngx-charts";
import {CustomTimelineChartComponent} from "./components/time-line/custom-timeline-chart/custom-timeline-chart.component";
import {MouseWheelDirective} from "./components/time-line/directives/mouse-wheel.directive";
import {InitChartComponent} from "./components/time-line/init-chart/init-chart.component";
import {TagsFilterComponent} from './components/card-list/filters/tags-filter/tags-filter.component';
import {TypeaheadModule} from "ngx-type-ahead";
import {TimeService} from "@ofServices/time.service";
import {UtilitiesModule} from "../utilities/utilities.module";
import { SeveritySortComponent } from './components/card-list/filters/severity-sort/severity-sort.component';
import {FontAwesomeIconsModule} from "../utilities/fontawesome-icons.module";
import { FlatpickrModule } from 'angularx-flatpickr';

@NgModule({
    imports: [
        TypeaheadModule,
        CommonModule,
        FormsModule,
        NgxChartsModule,
        ChartCommonModule,
        ReactiveFormsModule,
        TranslateModule,
        NgbModule.forRoot(),
        CardsModule,
        FeedRoutingModule,
        FontAwesomeIconsModule,
        UtilitiesModule,
        FlatpickrModule.forRoot()
    ],
    declarations: [CardListComponent, FeedComponent, NoSelectionComponent, TimeLineComponent, FiltersComponent, TypeFilterComponent, TimeFilterComponent,
        InitChartComponent,
        CustomTimelineChartComponent,
        MouseWheelDirective,
        TagsFilterComponent,
        SeveritySortComponent],
    exports: [FeedComponent],
    providers: [ {provide: TimeService, useClass: TimeService}]
})
export class FeedModule {
}
