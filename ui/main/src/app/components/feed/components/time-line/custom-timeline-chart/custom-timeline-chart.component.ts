/* Copyright (c) 2018-2025, RTE (http://www.rte-france.com)
 * Copyright (c) 2023, Alliander (http://www.alliander.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Inject,
    Input,
    NgZone,
    OnDestroy,
    OnInit,
    Output,
    PLATFORM_ID,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {scaleLinear, scaleTime} from 'd3-scale';
import {
    BaseChartComponent,
    calculateViewDimensions,
    ChartComponent,
    ScaleType,
    ViewDimensions,
    ChartCommonModule,
    AxesModule
} from '@swimlane/ngx-charts';
import {NgbPopover} from '@ng-bootstrap/ng-bootstrap';
import {TimelineView} from 'app/views/timeline/timeline.view';
import {Observable} from 'rxjs';
import {format} from 'date-fns';
import {MouseWheelDirective} from '../directives/mouse-wheel.directive';
import {NgFor, NgIf, AsyncPipe} from '@angular/common';
import {NavigationService} from '@ofServices/navigation/NavigationService';

@Component({
    selector: 'of-custom-timeline-chart',
    templateUrl: './custom-timeline-chart.component.html',
    styleUrls: ['./custom-timeline-chart.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [ChartCommonModule, MouseWheelDirective, NgFor, NgIf, AxesModule, NgbPopover, AsyncPipe]
})
export class CustomTimelineChartComponent extends BaseChartComponent implements OnInit, OnDestroy {
    @Input() domainId;
    @Input() valueDomain;
    // Hack to force reload of the timeline when the user switch from hidden timeline
    // to visible timeline by cliking on "show timeline" :
    // When isHidden will change from true to false, it will trigger ngOnchange in ngx-chart and reprocess the chart drawing
    // It solves bugs :
    // - https://github.com/opfab/operatorfabric-core/issues/3346
    // - https://github.com/opfab/operatorfabric-core/issues/3348
    @Input() isHidden;

    @Output() zoomChange: EventEmitter<string> = new EventEmitter<string>();

    @ViewChild(ChartComponent, {read: ElementRef}) chart: ElementRef;

    public timeLineView;

    public dims: ViewDimensions;
    public yScale: any;
    public xScale: any;
    public translateGraph: string;

    public xRealTimeLine: Date;

    public currentCircleHovered;
    public openPopover: NgbPopover;
    public popoverTimeOut;

    private readonly changeDetectorRef: ChangeDetectorRef;
    private isDestroyed = false;

    public circles$: Observable<any>;

    constructor(chartElement: ElementRef, zone: NgZone, cd: ChangeDetectorRef, @Inject(PLATFORM_ID) platformId: any) {
        super(chartElement, zone, cd, platformId);
        this.timeLineView = new TimelineView();
        this.changeDetectorRef = cd;
        this.circles$ = this.timeLineView.getCircles();
    }

    ngOnInit(): void {
        this.updateRealtime();
    }

    /**
     * loop function to set xRealTimeLine at the actual time
     * xRealTimeLine is a vertical bar which represent the current time
     * update the domain if check follow clock tick is true
     *  Stop it when destroying component to avoid memory leak
     */
    updateRealtime(): void {
        this.xRealTimeLine = new Date();
        this.changeDetectorRef.markForCheck();
        setTimeout(() => {
            if (!this.isDestroyed) this.updateRealtime();
        }, 1000);
    }

    /**
     * Main function for ngx-charts
     * called for each update on chart
     */
    update(): void {
        this.timeLineView.setDomain(this.domainId, this.valueDomain);
        super.update();
        this.updateDimensions();
    }

    updateDimensions(): void {
        this.dims = calculateViewDimensions({
            width: this.width,
            height: this.height,
            margins: [30, 15, 10, 0],
            showXAxis: true,
            showYAxis: true,
            xAxisHeight: 19,
            yAxisWidth: 0,
            showLegend: false,
            legendType: ScaleType.Time
        });

        this.xScale = scaleTime().range([0, this.dims.width]).domain(this.timeLineView.getTimeGridDomain());
        this.yScale = scaleLinear().range([this.dims.height, 0]).domain([0, 5]);
        this.translateGraph = `translate(${this.dims.xOffset} , 30)`;
    }

    //
    // FOLLOWING METHODS ARE CALLED FROM THE HTML
    //

    emptyLabel(): string {
        return '';
    }

    onCircleClick(circle) {
        if (circle.count === 1) {
            this.showCard(circle.summary[0].cardId);
        }
    }

    showCard(cardId): void {
        if (this.openPopover) {
            this.openPopover.close();
        }
        NavigationService.navigateToCard(cardId);
        this.scrollToSelectedCard();
    }

    scrollToSelectedCard() {
        // wait for 500ms to be sure the card is selected and scroll to the card with his id (opfab-selected-card-summary)
        setTimeout(() => {
            const selectedCard = document.getElementById('opfab-selected-card-summary');
            if (selectedCard) selectedCard.scrollIntoView({behavior: 'smooth', block: 'center'});
        }, 500);
    }

    getXRealTimeLineFormatting(xRealTimeLine) {
        return format(xRealTimeLine, 'dd/MM/yy HH:mm');
    }

    getRealTimeTextPosition() {
        return Math.max(this.xScale(this.xRealTimeLine), 50); // To avoid going to much on the left, 50px min
    }

    feedCircleHovered(myCircle, p): void {
        if (this.openPopover) {
            this.openPopover.close();
        }
        clearTimeout(this.popoverTimeOut);
        this.openPopover = p;
        this.currentCircleHovered = myCircle;
    }

    onMouseLeave() {
        if (this.openPopover) {
            this.popoverTimeOut = setTimeout(() => {
                this.openPopover.close();
            }, 1000);
        }
    }

    onMouseEnter() {
        clearTimeout(this.popoverTimeOut);
    }

    /**
     *  change for next or previous zoom set by buttons conf
     */
    onZoom($event: MouseEvent, direction): void {
        this.zoomChange.emit(direction);
    }

    ngOnDestroy() {
        this.timeLineView.destroy();
        this.isDestroyed = true;
    }
}
