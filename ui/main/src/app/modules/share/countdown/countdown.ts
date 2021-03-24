/* Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


export class CountDown {

    private counting = false;
    private ended = false;
    private stop = false;
    private endTime: number;
    private milliSecondsBeforeEndTimeForStartingCount: number;
    private countDown = "";

    constructor(endTime: number, secondsBeforeEndTimeForStartingCount: number) {
        this.endTime = endTime;
        this.milliSecondsBeforeEndTimeForStartingCount = secondsBeforeEndTimeForStartingCount * 1000;
        this.computeCountDown();
    }


    private computeCountDown() {
        if (this.stop) return;
        const remindingTime = this.endTime - new Date().valueOf();
        if (remindingTime < 0) {
            this.counting = false;
            this.ended = true;
            return;
        } 
        if (remindingTime < this.milliSecondsBeforeEndTimeForStartingCount) {

            this.counting = true;
            const remindingTimeInSeconds = Math.round(remindingTime / 1000);

            const hours = Math.floor(remindingTimeInSeconds / 3600);
            const minutes = Math.floor((remindingTimeInSeconds % 3600) / 60);
            const seconds = remindingTimeInSeconds % 60;

            const minutesAsString = this.convertNumberOnTwoDigitString(minutes);
            const secondsAsString = this.convertNumberOnTwoDigitString(seconds);

            this.countDown = minutesAsString + ':' + secondsAsString;
            if (hours != 0) this.countDown = hours + ':' + this.countDown;
        }
        // reprocess 500ms after
        setTimeout(() => this.computeCountDown(), 500);
    }

    private convertNumberOnTwoDigitString(numberToConvert: number): string {
        if (numberToConvert < 10) return '0' + numberToConvert;
        return numberToConvert.toString();
    }


    public isCounting(): boolean {
        return this.counting;
    }

    public isEnded(): boolean {
        return this.ended;
    }

    public getCountDown(): string {
        return this.countDown;
    }

    public stopCountDown(): void {
        this.stop = true;
    }

}
