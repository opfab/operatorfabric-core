/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


import {TestBed} from '@angular/core/testing';
import {Store} from "@ngrx/store";
import {AppState} from "@ofStore/index";
import {I18nService} from "@ofServices/i18n.service";
import {of} from "rxjs";
import {settingsInitialState} from "@ofStates/settings.state";
import {map} from "rxjs/operators";
import {TranslateModule} from "@ngx-translate/core";
import {emptyAppState4Test} from "@tests/helpers";
import createSpyObj = jasmine.createSpyObj;
import SpyObj = jasmine.SpyObj;
import {configInitialState} from "@ofStates/config.state";

describe('I18nService', () => {

    let mockStore: SpyObj<Store<AppState>>;
    let emptyAppState: AppState = {
        ...emptyAppState4Test,
        config: configInitialState
    };

    beforeEach(() => {
        const storeSpy = createSpyObj('Store', ['dispatch', 'select']);
        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot({
                useDefaultLang: false
            })],
            providers: [I18nService, {provide: Store, useValue: storeSpy}]
        });
        mockStore = TestBed.get(Store);
        mockStore.select.and.callFake(selector => {
            return of({
                ...emptyAppState, settings: {
                    ...settingsInitialState,
                    loaded: true,
                    settings: {
                        locale: 'de',
                        timeZone: 'America/Thule'
                    }
                }
            }).pipe(
                map(v => selector(v))
            )
        });

    });

    it('sets locale and timezone according to state'
        , (done) => {
            const service = TestBed.get(I18nService)
            setTimeout(() => {
                try {
                    expect(service.locale).toEqual('de');
                    expect(service.timeZone).toEqual('America/Thule');
                } finally {

                    done();
                }
            });
        });
});
