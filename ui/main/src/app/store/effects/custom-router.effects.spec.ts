/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Actions} from '@ngrx/effects';
import {hot} from 'jasmine-marbles';
import {async} from "@angular/core/testing";
import {Store} from "@ngrx/store";
import {AppState} from "@ofStore/index";
import {CustomRouterEffects} from "@ofEffects/custom-router.effects";
import {ROUTER_REQUEST} from "@ngrx/router-store";
import {NavigationStart} from "@angular/router";
import {ClearLightCardSelection} from "@ofActions/light-card.actions";
import SpyObj = jasmine.SpyObj;

describe('CustomRouterEffects', () => {
    let effects: CustomRouterEffects;
    let mockStore: SpyObj<Store<AppState>>;

    beforeEach(async(() => {
        mockStore = jasmine.createSpyObj('Store', ['dispatch', 'select']);

    }))
    describe('navigateAwayFromFeed', () => {
        it('should trigger ClearLightCardSelection if navigating from feed/cards/* to somewhere else', () => {

            const navigation = {
                type: ROUTER_REQUEST,
                payload: {
                    routerState: {
                        url: "/feed/cards/myCardId"
                    },
                    event: new NavigationStart(1,"/archive/")
                }
            }

            const localActions$ = new Actions(hot('-a-', { a: navigation}));

            const expectedAction = new ClearLightCardSelection();
            const localExpected = hot('-b-', {b: expectedAction});

            effects = new CustomRouterEffects(mockStore, localActions$);

            expect(effects).toBeTruthy();
            expect(effects.navigateAwayFromFeed).toBeObservable(localExpected);

        });

        it('should not trigger ClearLightCardSelection if navigating inside feed/card ', () => {

            const navigation = {
                type: ROUTER_REQUEST,
                payload: {
                    routerState: {
                        url: "/feed/cards/myCardId"
                    },
                    event: new NavigationStart(1,"/feed/cards/myOtherCardId/")
                }
            }

            const localActions$ = new Actions(hot('-a-', { a: navigation}));

            const localExpected = hot('-');

            effects = new CustomRouterEffects(mockStore, localActions$);

            expect(effects).toBeTruthy();
            expect(effects.navigateAwayFromFeed).toBeObservable(localExpected);

        });

        it('should not trigger ClearLightCardSelection if coming from somewhere else', () => {

            const navigation = {
                type: ROUTER_REQUEST,
                payload: {
                    routerState: {
                        url: "/archive"
                    },
                    event: new NavigationStart(1,"/someOtherMenu")
                }
            }

            const localActions$ = new Actions(hot('-a-', { a: navigation}));

            const localExpected = hot('-');

            effects = new CustomRouterEffects(mockStore, localActions$);

            expect(effects).toBeTruthy();
            expect(effects.navigateAwayFromFeed).toBeObservable(localExpected);

        });

    });

});
