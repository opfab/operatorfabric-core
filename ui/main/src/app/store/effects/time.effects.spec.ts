/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {TimeEffects} from "@ofEffects/time.effects";
import {TimeService} from "@ofServices/time.service";
import {AppState} from "@ofStore/index";
import {Store} from "@ngrx/store";
import {async} from "@angular/core/testing";
import {hot} from "jasmine-marbles";
import {Actions} from "@ngrx/effects";
import {UserApplicationRegistered} from '@ofStore/actions/user.actions';
import {User} from '@ofModel/user.model';
import moment from "moment-timezone";
import {Tick} from "@ofActions/time.actions";
import SpyObj = jasmine.SpyObj;

describe('TimeEffects', () => {

    let effects: TimeEffects;
    let timeService: SpyObj<TimeService>;
    let storeMock: SpyObj<Store<AppState>>;
    let localAction$: Actions;
    let  momentForTesting;


    beforeEach(async(() => {

        momentForTesting = moment()
        timeService = jasmine.createSpyObj('TimeService', ['pulsate']);


        storeMock = jasmine.createSpyObj('Store', ['dispatch', 'select', 'subscribe']);


        localAction$ = new Actions(hot('a-----', {
            a: new UserApplicationRegistered({user: new User("userRegisterd", "aa", "bb")})
        }));


    }));
    describe('heartBeat', () => {
        it('should emit (clock) tick actions after the user is logged in', () => {

            timeService.pulsate.and.returnValue(hot('-bcd', {
                b: {currentTime: momentForTesting, elapsedSinceLast: 1},
                c: {currentTime: momentForTesting, elapsedSinceLast: 1},
                d: {currentTime: momentForTesting, elapsedSinceLast: 1}}));

            const localExpected = hot('-bcd'
                , { b: new Tick({currentTime: momentForTesting, elapsedSinceLast: 1})
                    , c: new Tick({currentTime: momentForTesting, elapsedSinceLast: 1})
                    , d: new Tick({currentTime: momentForTesting, elapsedSinceLast: 1})
                }
            );


            effects = new TimeEffects(storeMock, localAction$, timeService);

            expect(effects).toBeTruthy();
            expect(effects.heartBeat).toBeObservable(localExpected);

        });

    });
});
