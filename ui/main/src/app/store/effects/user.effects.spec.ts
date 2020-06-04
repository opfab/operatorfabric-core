
 
/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {getSeveralRandomLightCards} from '@tests/helpers';
import {Actions} from '@ngrx/effects';
import {hot} from 'jasmine-marbles';
import {ArchiveEffects} from '@ofEffects/archive.effects';
import {ArchiveQuerySuccess, SendArchiveQuery} from '@ofActions/archive.actions';
import {LightCard} from '@ofModel/light-card.model';
import {Page} from '@ofModel/page.model';
import { UserEffects } from './user.effects';
import { UserApplicationRegistered } from '@ofStore/actions/user.actions';
import { User } from '@ofModel/user.model';

xdescribe('UserEffects', () => {
    // let userEeffects: UserEffects;

    // it('should return an UserApplicationRegistered after asking the service askUserApplicationRegistered ', () => {
        // const userPayload_identifier =  "userRegistered";
        
        // const userApplicationRegistered = hot('-a--', {
        //     a: new UserApplicationRegistered({
        //         user : new User("userRegistered", "firstName", "lastName")
        //     })
        // });
        // const localActions$ = new Actions(userApplicationRegistered);
        // const localMockUserService = jasmine.createSpyObj('UserService', ['askUserApplicationRegistered']);

        // const mockStore = jasmine.createSpyObj('Store', ['dispatch', 'select']);

        // const expectedPage = new Page<LightCard>(1, expectedLightCards.length, expectedLightCards);
        // localMockUserService.askUserApplicationRegistered.and.returnValue(hot('---b', {b: expectedPage}));
        
        // const expectedAction = new ArchiveQuerySuccess({resultPage: expectedPage});
        // const localExpected = hot('---c', {c: expectedAction});

        // userEeffects = new UserEffects(mockStore, localActions$, localMockUserService);
        // expect(userEeffects).toBeTruthy();
        // expect(userEeffects.checkUserApplication).toBeObservable(localExpected);
    // });
});


// describe('ArchiveEffects', () => {
//     let effects: ArchiveEffects;
//     it('should return an ArchiveQuerySuccess after SendArchiveQuery triggers query through cardService (no paging) ', () => {
//         const expectedLightCards =  getSeveralRandomLightCards();
//         const expectedPage = new Page<LightCard>(1, expectedLightCards.length, expectedLightCards);
//         const simulateTime = hot('-a--', {
//             a: new SendArchiveQuery({
//                 params: new Map<string, string[]>()
//             })
//         });
//         const localActions$ = new Actions(simulateTime);
//         const localMockCardService = jasmine.createSpyObj('CardService', ['fetchArchivedCards']);
//         const mockStore = jasmine.createSpyObj('Store', ['dispatch', 'select']);
//         localMockCardService.fetchArchivedCards.and.returnValue(hot('---b', {b: expectedPage}));
//         const expectedAction = new ArchiveQuerySuccess({resultPage: expectedPage});
//         const localExpected = hot('---c', {c: expectedAction});
//         effects = new ArchiveEffects(mockStore, localActions$, localMockCardService);
//         expect(effects).toBeTruthy();
//         expect(effects.queryArchivedCards).toBeObservable(localExpected);
//     });
// });
