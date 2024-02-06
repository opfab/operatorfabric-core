/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import moment, {Moment} from 'moment';

export class Rectangle {
    public start: number;
    public end: number;
    public changeBgColor: boolean;
    public dateToDisplay: string;
}

export class XAxis {
    private domainId: string;
    private gridTimeDomain: Array<number>;
    private ticks: Array<Moment> = [];
    private ticksLabel: Map<number, string> = new Map<number, string>();
    private tickSizeMap = {
        TR: {amount: 15 as moment.DurationInputArg1, unit: 'minute' as moment.DurationInputArg2},
        J: {amount: 30 as moment.DurationInputArg1, unit: 'minute' as moment.DurationInputArg2},
        '7D': {amount: 4 as moment.DurationInputArg1, unit: 'hour' as moment.DurationInputArg2},
        W: {amount: 4 as moment.DurationInputArg1, unit: 'hour' as moment.DurationInputArg2},
        M: {amount: 1 as moment.DurationInputArg1, unit: 'day' as moment.DurationInputArg2}
    };
    private dayRectangles;

    public setupAxis(domainId: string, gridTimeDomain: Array<number>): void {
        this.domainId = domainId;
        this.gridTimeDomain = gridTimeDomain;
        this.computeTickValues();
        this.computeTickLabels();
        this.computeDayRectangles();
    }

    private computeTickValues(): void {
        const startDomain = moment(this.gridTimeDomain[0]);
        this.ticks = [startDomain];
        const currentTick = moment(startDomain);

        while (currentTick.valueOf() < this.gridTimeDomain[1].valueOf()) {
            this.goToNextTick(currentTick);
            this.ticks.push(moment(currentTick));
        }
    }

    private goToNextTick(currentTick: moment.Moment) {
        if (this.domainId === 'Y') {
            if (currentTick.isSame(moment(currentTick).startOf('month'))) {
                currentTick.add(15, 'day');
            } else {
                currentTick.add(1, 'month').startOf('month');
            }
            return;
        }
        const tickSize = this.tickSizeMap[this.domainId];
        currentTick.add(tickSize.amount, tickSize.unit);
        if (this.domainId === '7D' || this.domainId === 'W') {
            this.adjustForDaylightSaving(currentTick);
        }
    }

    private adjustForDaylightSaving(tick: moment.Moment) {
        // Deal with winter/summer time changes
        // if hour is 5, we are switching from winter to summer time, we subtract 1 hour to keep  ticks  to 04 / 08 / 12 ...
        // if hour is 3, we are switching from summer to winter time, we add 1 hour to keep  ticks  to 04 / 08 / 12 ...
        if (tick.hour() === 5) {
            tick.subtract(1, 'hour');
        } else if (tick.hour() === 3) {
            tick.add(1, 'hour');
        }
    }

    private computeTickLabels() {
        this.ticksLabel = new Map<number, string>();

        switch (this.domainId) {
            case 'TR':
                this.computeTickLabelsForTR();
                break;
            case 'J':
            case 'M':
            case 'Y':
                this.computeTickLabelsForJMY();
                break;
            case '7D':
            case 'W':
                this.computeTickLabelsFor7DW();
                break;
            default:
        }
    }

    private computeTickLabelsForTR(): void {
        this.ticks.forEach((tick) => {
            if (tick.minute() === 0 || tick.minute() === 30)
                this.ticksLabel.set(tick.valueOf(), this.computeTickLabel(tick, 'TR'));
            else this.ticksLabel.set(tick.valueOf(), '');
        });
    }

    private computeTickLabel = (value: Moment, domainId: string): string => {
        switch (domainId) {
            case 'TR':
                if (value.minute() === 0) return value.format('HH') + 'h';
                return value.format('HH') + 'h30';
            case 'J':
                return value.format('HH') + 'h';
            case '7D':
            case 'W':
                return value.format('HH') + 'h';
            case 'M':
                return value.format('ddd').toLocaleUpperCase().substring(0, 3) + value.format(' DD');
            case 'Y':
                return value.format('D MMM');
            default:
                return '';
        }
    };

    private computeTickLabelsForJMY(): void {
        for (let i = 0; i < this.ticks.length; i++) {
            if (i % 2 === 0) {
                this.ticksLabel.set(this.ticks[i].valueOf(), this.computeTickLabel(this.ticks[i], this.domainId));
            } else {
                this.ticksLabel.set(this.ticks[i].valueOf(), '');
            }
        }
    }

    private computeTickLabelsFor7DW(): void {
        this.ticks.forEach((tick) => {
            if (tick.hour() === 0 || tick.hour() === 8 || tick.hour() === 16)
                this.ticksLabel.set(tick.valueOf(), this.computeTickLabel(tick, this.domainId));
            else this.ticksLabel.set(tick.valueOf(), '');
        });
    }

    private computeDayRectangles() {
        this.dayRectangles = new Array();
        if (this.domainId === 'W' || this.domainId === '7D') {
            let startOfDay = this.gridTimeDomain[0];
            let changeBgColor = true;
            while (startOfDay < this.gridTimeDomain[1]) {
                let endOfDay = moment(startOfDay).set('hour', 23).set('minute', 59).valueOf();
                if (endOfDay.valueOf() > this.gridTimeDomain[1]) endOfDay = this.gridTimeDomain[1];
                const rectangle: Rectangle = {
                    start: startOfDay,
                    end: endOfDay,
                    changeBgColor: changeBgColor,
                    dateToDisplay: this.getWeekFormatting(startOfDay, endOfDay)
                };
                this.dayRectangles.push(rectangle);
                startOfDay = moment(startOfDay).add(1, 'day').set('hour', 0).set('minute', 0).valueOf();
                changeBgColor = !changeBgColor;
            }
        }
    }

    private getWeekFormatting(start: number, end: number) {
        if (end - start < 43200000) return ''; //  12h =>  12h*3600s*1000ms =  43200000ms
        return moment(start).format('ddd DD MMM');
    }

    public getTickLabel = (value): string => {
        const format = this.ticksLabel.get(value.valueOf());
        return format ?? '';
    };

    public getDayRectangles(): Array<any> {
        return this.dayRectangles;
    }

    public getTicks(): Array<any> {
        return this.ticks;
    }
}
