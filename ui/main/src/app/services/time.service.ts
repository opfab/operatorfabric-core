/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Injectable} from '@angular/core';
import * as moment from 'moment';

@Injectable()
export class TimeService {

    constructor() {
    }

    public currentTime(): moment.Moment {
        return moment();
    }

    public parseString(value: string): moment.Moment {
        return moment(value,'YYYY-MM-DDTHH:mm');
    }

    public asInputString(value: number): string {
        return moment(value).format('YYYY-MM-DDTHH:mm:ss.SSS');
    }
}
