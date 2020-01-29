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
import {TimeReference, TimeSpeed} from "@ofModel/time.model";
import {FailToUpdateTimeReference, Tick, UpdateTimeReference} from "@ofActions/time.actions";
import {of} from "rxjs";
import {Message, MessageLevel} from "@ofModel/message.model";
import {I18n} from "@ofModel/i18n.model";
import {Map} from "@ofModel/map";
import {UserApplicationRegistered} from '@ofStore/actions/user.actions';
import {User} from '@ofModel/user.model';
import moment = require("moment-timezone");
import SpyObj = jasmine.SpyObj;

describe('TimeEffects', () => {

    let effects: TimeEffects;
    let timeService: SpyObj<TimeService>;
    let storeMock: SpyObj<Store<AppState>>;
    let timeRef: SpyObj<TimeReference>;
    let localAction$: Actions;
    let  momentForTesting;


    beforeEach(async(() => {

        timeRef = jasmine.createSpyObj('TimeReference', ['computeNow']);
        momentForTesting = moment()
        timeService = jasmine.createSpyObj('TimeService', ['pulsate', 'fetchTimeReferences']);


        storeMock = jasmine.createSpyObj('Store', ['dispatch', 'select', 'subscribe']);
        storeMock.select.and.returnValue(of(timeRef));


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
    describe('stickToVirtualTime', () => {
        it('should emit an UpdateTimeReference action containng time reference once the user is logged in', () => {

            const firstTR=new TimeReference(1,2,3,TimeSpeed.X3600);
            const secondTR=new TimeReference(4,5,6,TimeSpeed.X10);
            const thirdTR=new TimeReference(7,8,9,TimeSpeed.HALF);

            timeService.fetchTimeReferences.and.returnValue(hot('a--b-c', {
                a: firstTR,
                b: secondTR,
                c: thirdTR
            }))

            const localExpected = hot('a--b-c',
                {
                    a:new UpdateTimeReference({timeReference:firstTR}),
                    b:new UpdateTimeReference({timeReference:secondTR}),
                    c:new UpdateTimeReference({timeReference:thirdTR})
                });

            effects = new TimeEffects(storeMock,localAction$,timeService);

            expect(effects).toBeTruthy();
            expect(effects.stickToVirtualTime).toBeObservable(localExpected);

        });
        it('should store an error message if something went wrong during time reference update  once the ' +
            'user is logged in', () => {

            timeService.fetchTimeReferences.and.returnValue(hot('---#'));

            effects = new TimeEffects(storeMock,localAction$,timeService);

            const i18nParameters = new Map<string>();
            i18nParameters['message'] = 'error';


            const localExpected = hot('---a',{a:new FailToUpdateTimeReference({error:new Message(
                        'something went wrong during Time Reference update from Time service',
                        MessageLevel.ERROR,
                        new I18n('time.error', i18nParameters))})});

            expect(effects).toBeTruthy();
            expect(effects.stickToVirtualTime).toBeObservable(localExpected);


        })
    })
});
