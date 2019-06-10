/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {MenuEffects} from './menu.effects';
import {getRandomMenu} from '@tests/helpers';
import {Actions} from '@ngrx/effects';
import {hot} from 'jasmine-marbles';
import {LoadMenu, LoadMenuSuccess} from "@ofActions/menu.actions";
import {of} from "rxjs";
import {Router} from "@angular/router";
import SpyObj = jasmine.SpyObj;
import createSpyObj = jasmine.createSpyObj;

describe('MenuEffects', () => {
    let effects: MenuEffects;

    it('should return a LoadLightMenusSuccess when the menuService serve an array of Light Menu', () => {
        const expectedMenu =  getRandomMenu();

        const localActions$ = new Actions(hot('-a--', {a: new LoadMenu()}));

        const localMockMenuService = jasmine.createSpyObj('ThirdsService', ['computeThirdsMenu','loadI18nForMenuEntries']);
        localMockMenuService.loadI18nForMenuEntries.and.callFake(()=>of(true));

        const mockStore = jasmine.createSpyObj('Store',['dispatch']);

        localMockMenuService.computeThirdsMenu.and.returnValue(hot('---b', {b: expectedMenu}));
        const expectedAction = new LoadMenuSuccess({menu: expectedMenu});
        const localExpected = hot('---c', {c: expectedAction});

        const localMockRouter = jasmine.createSpyObj('Router', ['navigate']);

        effects = new MenuEffects(mockStore, localActions$, localMockMenuService, localMockRouter);

        expect(effects).toBeTruthy();
        expect(effects.load).toBeObservable(localExpected);
    });


});
