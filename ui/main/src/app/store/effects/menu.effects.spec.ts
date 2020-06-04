

import {MenuEffects} from './menu.effects';
import {getRandomMenus} from '@tests/helpers';
import {Actions} from '@ngrx/effects';
import {hot} from 'jasmine-marbles';
import {LoadMenu, LoadMenuSuccess} from "@ofActions/menu.actions";
import {of} from "rxjs";

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

});
