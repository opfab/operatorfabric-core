/* Copyright (c) 2018-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {DateTimeFormatterService} from 'app/services/dateTimeFormatter/DateTimeFormatterService';
import {add, sub, startOfDay, startOfMonth} from 'date-fns';

export class Rectangle {
    public start: number;
    public end: number;
    public changeBgColor: boolean;
    public dateToDisplay: string;
}

export class XAxis {
    private domainId: string;
    private gridTimeDomain: Array<number>;
    private ticks: Array<Date> = [];
    private ticksLabel: Map<number, string> = new Map<number, string>();

    private readonly tickSizeMap = {
        RT: {minutes: 15},
        J: {minutes: 30},
        '7D': {hours: 4},
        W: {hours: 4},
        M: {days: 1}
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
        const startDomain = new Date(this.gridTimeDomain[0]);
        this.ticks = [startDomain];
        let currentTick = startDomain;

        while (currentTick.getTime() < this.gridTimeDomain[1]) {
            currentTick = this.goToNextTick(currentTick);
            this.ticks.push(currentTick);
        }
    }

    private goToNextTick(currentTick: Date): Date {
        if (this.domainId === 'Y') {
            if (currentTick.getTime() === startOfMonth(currentTick).getTime()) {
                currentTick = add(currentTick, {days: 15});
            } else {
                currentTick = add(currentTick, {months: 1});
                currentTick = startOfMonth(currentTick);
            }
            return currentTick;
        }
        const tickSize = this.tickSizeMap[this.domainId];
        currentTick = add(currentTick, tickSize);
        if (this.domainId === '7D' || this.domainId === 'W') {
            currentTick = this.adjustForDaylightSaving(currentTick);
        }
        return currentTick;
    }

    private adjustForDaylightSaving(tick: Date): Date {
        // Deal with winter/summer time changes
        // if hour is 5, we are switching from winter to summer time, we subtract 1 hour to keep  ticks  to 04 / 08 / 12 ...
        // if hour is 3, we are switching from summer to winter time, we add 1 hour to keep  ticks  to 04 / 08 / 12 ...

        if (tick.getHours() === 5) {
            tick = sub(tick, {hours: 1});
        } else if (tick.getHours() === 3) {
            tick = add(tick, {hours: 1});
        }
        return tick;
    }

    private computeTickLabels() {
        this.ticksLabel = new Map<number, string>();

        switch (this.domainId) {
            case 'RT':
                this.computeTickLabelsForRT();
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

    private computeTickLabelsForRT(): void {
        this.ticks.forEach((tick) => {
            if (tick.getMinutes() === 0 || tick.getMinutes() === 30)
                this.ticksLabel.set(tick.valueOf(), this.computeTickLabel(tick, 'RT'));
            else this.ticksLabel.set(tick.valueOf(), '');
        });
    }

    private readonly computeTickLabel = (value: Date, domainId: string): string => {
        switch (domainId) {
            case 'RT':
                if (value.getMinutes() === 0) return DateTimeFormatterService.getFormattedDate(value, 'HH') + 'h';
                return DateTimeFormatterService.getFormattedDate(value, 'HH') + 'h30';
            case 'J':
                return DateTimeFormatterService.getFormattedDate(value, 'HH') + 'h';
            case '7D':
            case 'W':
                return DateTimeFormatterService.getFormattedDate(value, 'HH') + 'h';
            case 'M':
                return (
                    DateTimeFormatterService.getFormattedDate(value, 'eee').toLocaleUpperCase().substring(0, 3) +
                    DateTimeFormatterService.getFormattedDate(value, ' dd')
                );
            case 'Y':
                return DateTimeFormatterService.getFormattedDate(value, 'd MMM');
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
            if (tick.getHours() === 0 || tick.getHours() === 8 || tick.getHours() === 16)
                this.ticksLabel.set(tick.valueOf(), this.computeTickLabel(tick, this.domainId));
            else this.ticksLabel.set(tick.valueOf(), '');
        });
    }

    private computeDayRectangles() {
        this.dayRectangles = new Array();
        if (this.domainId === 'W' || this.domainId === '7D') {
            let beginningOfDay = this.gridTimeDomain[0];
            let changeBgColor = true;
            while (beginningOfDay < this.gridTimeDomain[1]) {
                const endOfDayDate = new Date(beginningOfDay);
                endOfDayDate.setHours(23);
                endOfDayDate.setMinutes(59);
                let endOfDay = endOfDayDate.getTime();
                if (endOfDay > this.gridTimeDomain[1]) endOfDay = this.gridTimeDomain[1];
                const rectangle: Rectangle = {
                    start: beginningOfDay,
                    end: endOfDay,
                    changeBgColor: changeBgColor,
                    dateToDisplay: this.getWeekFormatting(beginningOfDay, endOfDay)
                };
                this.dayRectangles.push(rectangle);
                beginningOfDay = startOfDay(add(beginningOfDay, {days: 1})).getTime();
                changeBgColor = !changeBgColor;
            }
        }
    }

    private getWeekFormatting(start: number, end: number) {
        if (end - start < 43200000) return ''; //  12h =>  12h*3600s*1000ms =  43200000ms
        return DateTimeFormatterService.getFormattedDate(start, 'eee dd MMM');
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
