/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import * as moment from 'moment-timezone'
import {Message} from "@ofModel/message.model";

export interface TimeState {
    currentDate: moment.Moment;
    error: Message;
}

export const timeInitialState: TimeState = {
    currentDate: moment(),
    error: null
}
