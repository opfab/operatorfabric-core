/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


import {MenuEffects} from './menu.effects';
import {getRandomAlphanumericValue, getRandomMenus} from '@tests/helpers';
import {Actions} from '@ngrx/effects';
import {hot} from 'jasmine-marbles';
import {LoadMenu, LoadMenuSuccess, SelectMenuLink, SelectMenuLinkSuccess} from "@ofActions/menu.actions";
import {of} from "rxjs";
import {Router} from "@angular/router";

describe('MenuEffects', () => {
    let effects: MenuEffects;

    it('should return a LoadLightMenusSuccess when the menuService serve an array of menus', () => {
        const expectedMenu =  getRandomMenus();

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

    it('should return SelectMenuLinkSuccess when third-party menu entry link exists', () =>{

        const mockStore = jasmine.createSpyObj('Store',['dispatch']);
        const localMockRouter = jasmine.createSpyObj('Router', ['navigate']);

        const localActions$ = new Actions(hot('-a--', {a: new SelectMenuLink({menu_id: 't5',menu_version: '1',menu_entry_id: 'id1'})}));
        const expected_url = getRandomAlphanumericValue(5,24);

        const localMockMenuService = jasmine.createSpyObj('ThirdsService', ['queryMenuEntryURL']);
        localMockMenuService.queryMenuEntryURL.and.returnValue(hot('---b', {b: expected_url}));

        const expectedAction = new SelectMenuLinkSuccess({iframe_url: expected_url});
        const localExpected = hot('---c', {c: expectedAction});

        effects = new MenuEffects(mockStore, localActions$, localMockMenuService, localMockRouter);

        expect(effects).toBeTruthy();
        expect(effects.resolveThirdPartyLink).toBeObservable(localExpected);

    })


});
