/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {reducer} from "@ofStore/reducers/time.reducer"
import {timeInitialState} from "@ofStates/time.state";
import moment from "moment-timezone";
import {Tick} from "@ofActions/time.actions";


describe('TimeReducer', () => {

        describe('tick action', () => {
            it('should update currentDate', () => {
                const testedTime = moment();

                const tick = new Tick({currentTime: testedTime, elapsedSinceLast: 10});
                const actualState = reducer(timeInitialState, tick);
                const initialTime=timeInitialState.currentDate.valueOf();
                const actual = actualState.currentDate.valueOf();
                const expectedTime=testedTime.valueOf();
                expect(actual).toEqual(expectedTime);
                expect(actual).not.toEqual(initialTime);

            });
        })
});
