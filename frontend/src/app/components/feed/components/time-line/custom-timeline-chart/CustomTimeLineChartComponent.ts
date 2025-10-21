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
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    ViewEncapsulation,
    inject
} from '@angular/core';
import {NgbPopover} from '@ng-bootstrap/ng-bootstrap';
import {TimelineView} from 'app/components/feed/components/time-line/custom-timeline-chart/view/TimelineView';
import {Observable} from 'rxjs';
import {format} from 'date-fns';
import {NgFor, NgIf, AsyncPipe} from '@angular/common';
import {NavigationService} from '@ofServices/navigation/NavigationService';

@Component({
    selector: 'of-custom-timeline-chart',
    templateUrl: './CustomTimeLineChartComponent.html',
    styleUrls: ['./CustomTimeLineChartComponent.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgFor, NgIf, NgbPopover, AsyncPipe]
})
export class CustomTimelineChartComponent implements OnInit, OnDestroy, OnChanges {
    @Input() domainId;
    @Input() valueDomain;
    @Output() zoomChange: EventEmitter<string> = new EventEmitter<string>();

    public timeLineView;
    public xRealTimeLine: Date;
    public currentCircleHovered;
    public openPopover: NgbPopover;
    public popoverTimeOut;

    private readonly changeDetectorRef: ChangeDetectorRef;
    private isDestroyed = false;

    public circles$: Observable<any>;

    public timeLineWidth: number;
    public timeLineHeight: number;
    public gridWidth: number;
    public gridHeight: number;

    constructor() {
        const cd = inject(ChangeDetectorRef);

        this.timeLineView = new TimelineView();
        this.changeDetectorRef = cd;
        this.circles$ = this.timeLineView.getCircles();
    }

    ngOnInit(): void {
        this.computeDimensions();
        this.updateRealtime();
        window.addEventListener('resize', this.onWindowResize);
    }

    ngOnChanges(): void {
        this.timeLineView.setDomain(this.domainId, this.valueDomain);
    }

    onWindowResize = () => {
        this.computeDimensions();
    };

    computeDimensions(): void {
        this.timeLineWidth = window.innerWidth - 60;
        this.timeLineHeight = 160;
        this.gridWidth = this.timeLineWidth - 20;
        this.gridHeight = 95;
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

    //
    // FOLLOWING METHODS ARE CALLED FROM THE HTML
    //
    circleHovered(myCircle, p): void {
        if (this.openPopover) {
            this.openPopover.close();
        }
        clearTimeout(this.popoverTimeOut);
        this.openPopover = p;
        this.currentCircleHovered = myCircle;
    }

    getTimeLineTitle() {
        return this.timeLineView.getTitle();
    }

    getXCoordinate(epochDate: number): number {
        const domain = this.timeLineView.getTimeGridDomain();
        const start = domain[0];
        const end = domain[1];
        return ((epochDate - start) / (end - start)) * this.gridWidth;
    }

    getRealTimeBarText() {
        return format(this.xRealTimeLine, 'dd/MM/yy HH:mm');
    }

    getRealTimeBarTextPosition() {
        return Math.max(this.getXCoordinate(this.xRealTimeLine.valueOf()), 50); // To avoid going to much on the left, 50px min
    }

    getYCoordinate(value: number): number {
        return this.gridHeight - (value / 5) * this.gridHeight;
    }

    isRealTimeBarVisible() {
        return this.timeLineView.checkInsideDomain(this.xRealTimeLine);
    }

    onCircleClick(circle) {
        if (circle.count === 1) {
            this.showCard(circle.summary[0].cardId);
        }
    }

    onMouseEnter() {
        clearTimeout(this.popoverTimeOut);
    }

    onMouseLeave() {
        if (this.openPopover) {
            this.popoverTimeOut = setTimeout(() => {
                this.openPopover.close();
            }, 1000);
        }
    }

    onMouseWheel(event): void {
        this.zoomChange.emit(event.deltaY < 0 ? 'in' : 'out');
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

    ngOnDestroy() {
        this.timeLineView.destroy();
        this.isDestroyed = true;
        window.removeEventListener('resize', this.onWindowResize);
    }
}
