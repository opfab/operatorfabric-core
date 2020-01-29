/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import * as moment from 'moment-timezone';
import {isMoment} from "moment";

export class TimeReference {
    constructor(readonly referenceTime: number,
                readonly  virtualTime: number,
                readonly  computedNow: number,
                readonly speed: TimeSpeed) {
    }

    static convertSpeedIntoEnum(key: string, value: string) {
        if (key === 'speed') {
            return TimeSpeed[value]
        }
        return value;
    }


    computeNow(timeStampNow:number):moment.Moment;
    computeNow(momentNow:moment.Moment):moment.Moment;
    computeNow(realNow:number|moment.Moment):moment.Moment{

        let realNowMoment = null;
        if(isMoment(realNow)){
            realNowMoment=realNow
        }else{
            realNowMoment=moment(realNow);
        }
        return this.computeNowMoment(realNowMoment);

    }

    private computeNowMoment(realNowMoment: moment.Moment) {
        /**
         *   no computation for real time at normal speed with no virtualTime
         *   or if the referenceTime doesn't exist
         */

        if (typeof this.referenceTime === 'undefined' || this.referenceTime == null) {
                return realNowMoment;
        }else if(this.speed === TimeSpeed.X1 && this.isVirtualTimeUndefine()){
            return realNowMoment;
        }
        const ref = moment(this.referenceTime);
        const duration = moment.duration(realNowMoment.diff(ref));
        const computedOffsetInMilliseconds = duration.asMilliseconds() * this.speed;
        const computedOffsetDuration = moment.duration(computedOffsetInMilliseconds)
        let baseMoment=moment(this.virtualTime);
        if(this.isVirtualTimeUndefine()) {
            baseMoment=ref;
        }
        const result = baseMoment.add(computedOffsetDuration);
        return result;
    }

    private isVirtualTimeUndefine(){
        return typeof this.virtualTime === 'undefined' || this.virtualTime == null;
    }
}


export enum TimeSpeed {
    X1 = 1,
    X2 = 2,
    X10 = 10,
    X60 = 60,
    X3600 = 3600,
    HALF = 0.5
}

export const neutralTimeReference:TimeReference=new TimeReference(null,null,null,TimeSpeed.X1);
