/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {reducer} from "@ofStore/reducers/time.reducer"
import {timeInitialState} from "@ofStates/time.state";
import {FailToUpdateTimeReference, Tick, UpdateTimeReference} from "@ofActions/time.actions";
import {neutralTimeReference, TimeReference, TimeSpeed} from "@ofModel/time.model";
import {Message, MessageLevel} from "@ofModel/message.model";
import {I18n} from "@ofModel/i18n.model";
import {Map} from "@ofModel/map";
import moment = require("moment-timezone");

describe('TimeReducer', () => {

    describe('unknown action', () => {
        it('should return the initial state unchanged', () => {
            const unknownAction = {} as any;
            const actualState = reducer(timeInitialState, unknownAction);
            expect(actualState).toBe(timeInitialState);
        });
    });

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

    describe('UpdateTimeReference action', () =>{
       it( 'should update time reference', () =>{
           const expectedTimeRef = new TimeReference(1,2,3,TimeSpeed.X3600);
           const updateTimeRefAction = new UpdateTimeReference({timeReference:expectedTimeRef});
           const actualState = reducer(timeInitialState, updateTimeRefAction);
           const actualTimeRef= actualState.timeReference;
           expect(actualTimeRef).toEqual(expectedTimeRef);
           expect(actualTimeRef).not.toEqual(neutralTimeReference);
       });
    });
        describe('FailToUpdateTimeReference action', () =>{
            it('should update error', () => {

                const expectedError = 'expected error';

                const i18nParameters = new Map<string>();
                i18nParameters['params']='test';

                const expectedMessage = new Message(expectedError,
                    MessageLevel.ERROR, new I18n('test',i18nParameters));
                const failUpdate = new FailToUpdateTimeReference({error: expectedMessage});

                const actualState = reducer(timeInitialState,failUpdate);

                expect(actualState.error).toEqual(expectedMessage);

            });
        });
});
