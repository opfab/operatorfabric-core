/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



import {MenuEffects} from './menu.effects';
import {getRandomMenus} from '@tests/helpers';
import {Actions} from '@ngrx/effects';
import {hot} from 'jasmine-marbles';
import {LoadMenu, LoadMenuSuccess} from "@ofActions/menu.actions";
import {of} from "rxjs";

describe('MenuEffects', () => {
    let effects: MenuEffects;

    it('should return a LoadLightMenusSuccess when the Processes Service serve an array of menus', () => {
        const expectedMenu =  getRandomMenus();

        const localActions$ = new Actions(hot('-a--', {a: new LoadMenu()}));

        const localMockProcessesService = jasmine.createSpyObj('ProcessesService', ['computeMenu','loadI18nForMenuEntries']);
        localMockProcessesService.loadI18nForMenuEntries.and.callFake(()=>of(true));

        const mockStore = jasmine.createSpyObj('Store',['dispatch']);

        localMockProcessesService.computeMenu.and.returnValue(hot('---b', {b: expectedMenu}));
        const expectedAction = new LoadMenuSuccess({menu: expectedMenu});
        const localExpected = hot('---c', {c: expectedAction});

        const localMockRouter = jasmine.createSpyObj('Router', ['navigate']);

        effects = new MenuEffects(mockStore, localActions$, localMockProcessesService, localMockRouter);

        expect(effects).toBeTruthy();
        expect(effects.load).toBeObservable(localExpected);
    });

});
