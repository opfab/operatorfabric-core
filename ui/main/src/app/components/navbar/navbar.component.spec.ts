/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {NavbarComponent} from './navbar.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {RouterTestingModule} from '@angular/router/testing';
import {Store, StoreModule} from '@ngrx/store';
import {appReducer, AppState, storeConfig} from '@ofStore/index';
import { IconComponent } from './icon/icon.component';
import {EffectsModule} from '@ngrx/effects';
import {MenuEffects} from '@ofEffects/menu.effects';
import {ProcessesService} from '@ofServices/processes.service';
import {By} from '@angular/platform-browser';
import {InfoComponent} from './info/info.component';
import {TimeService} from '@ofServices/time.service';
import clock = jasmine.clock;
import { emptyAppState4Test,AuthenticationImportHelperForSpecs} from '@tests/helpers';
import { configInitialState } from '@ofStore/states/config.state';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { menuInitialState } from '@ofStore/states/menu.state';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { settingsInitialState } from '@ofStore/states/settings.state';
import { authInitialState } from '@ofStore/states/authentication.state';
import { selectCurrentUrl } from '@ofStore/selectors/router.selectors';
import {MenuLinkComponent} from './menus/menu-link/menu-link.component';
import { CustomLogoComponent } from './custom-logo/custom-logo.component';
import {FontAwesomeIconsModule} from "../../modules/utilities/fontawesome-icons.module";
import {GlobalStyleService} from '@ofServices/global-style.service';

enum MODE {
    HAS_NO_CONFIG,
    HAS_CONFIG_WITH_MENU,
    HAS_CONFIG_FOR_CONFIGURATION_WITH_LIMITSIZE_TRUE,
    HAS_CONFIG_FOR_CONFIGURATION_WITH_LIMITSIZE_FALSE,
    HAS_CONFIG_FOR_CONFIGURATION_WITH_LIMITSIZE_WRONG_VALUE,
    HAS_CONFIG_FOR_CONFIGURATION_WITH_LIMITSIZE_NOT_DEFINED
}

describe('NavbarComponent', () => {

    let store: Store<AppState>;
    let emptyAppState: AppState = emptyAppState4Test;

    let component: NavbarComponent;
    let fixture: ComponentFixture<NavbarComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [NgbModule.forRoot(),
                RouterTestingModule,
                StoreModule.forRoot(appReducer, storeConfig),
                EffectsModule.forRoot([MenuEffects]),
                HttpClientTestingModule,
                FontAwesomeIconsModule
            ],
            declarations: [NavbarComponent, IconComponent, CustomLogoComponent, InfoComponent, MenuLinkComponent],
            providers: [
                Store,
                ProcessesService,
                TimeService,
                AuthenticationImportHelperForSpecs,
                GlobalStyleService
            ]
        })
            .compileComponents();

    }));

    beforeEach(() => {
        store = TestBed.get(Store);
        fixture = TestBed.createComponent(NavbarComponent);
        component = fixture.componentInstance;
        spyOn(store, 'dispatch').and.callThrough();
        // avoid exceptions during construction and init of the component
        spyOn(store, 'pipe').and.callThrough();   

    });

    it('should create with a configuration no set', () => {
        defineFakeState(MODE.HAS_NO_CONFIG);   

        expect(component).toBeTruthy();
        expect(component.customLogo).toBe(undefined);
        expect(component.height).toBe(undefined);
        expect(component.width).toBe(undefined);
        expect(component.limitSize).toBe(undefined);
    });

    it('should create with the custom logo configuration set to true', () => {
        defineFakeState(MODE.HAS_CONFIG_FOR_CONFIGURATION_WITH_LIMITSIZE_TRUE);   

        expect(component).toBeTruthy();
        expect(component.customLogo).toBe("data:image/svg+xml;base64,abcde64");
        expect(component.height).toBe(64);
        expect(component.width).toBe(400);
        expect(component.limitSize).toBe(true);
    });

    it('should create with the custom logo configuration with limitSize to false', () => {
        defineFakeState(MODE.HAS_CONFIG_FOR_CONFIGURATION_WITH_LIMITSIZE_FALSE);   

        expect(component).toBeTruthy();
        expect(component.customLogo).toBe("data:image/svg+xml;base64,abcde64");
        expect(component.height).toBe(32);
        expect(component.width).toBe(200);
        expect(component.limitSize).toBe(false);
    });

    it('should create with the custom logo configuration with limitSize set to wrong value', () => {
        defineFakeState(MODE.HAS_CONFIG_FOR_CONFIGURATION_WITH_LIMITSIZE_WRONG_VALUE);   

        expect(component).toBeTruthy();
        expect(component.customLogo).toBe("data:image/svg+xml;base64,abcde64");
        expect(component.height).toBe(32);
        expect(component.width).toBe(200);
        expect(component.limitSize).toBe(undefined);
    });

    it('should create with the custom logo configuration with limitSize not defined', () => {
        defineFakeState(MODE.HAS_CONFIG_FOR_CONFIGURATION_WITH_LIMITSIZE_NOT_DEFINED);   

        expect(component).toBeTruthy();
        expect(component.customLogo).toBe("data:image/svg+xml;base64,abcde64");
        expect(component.height).toBe(16);
        expect(component.width).toBe(100);
        expect(component.limitSize).toBe(undefined);
    });

    it('should create plain link for single-entry third-party menu', () => {
        defineFakeState(MODE.HAS_CONFIG_WITH_MENU);   

        const rootElement = fixture.debugElement;
        expect(component).toBeTruthy();
        expect(rootElement.queryAll(By.css('li > div.nav-link')).length).toBe(1)
        expect(rootElement.queryAll(By.css('li > div.nav-link > of-menu-link > div a')).length).toBe(2) //Because there is two <a> for each menu entry: text link and icon
        expect(rootElement.queryAll(By.css('li > div.nav-link > of-menu-link > div a'))[0].nativeElement.attributes['ng-reflect-router-link'].value).toEqual("/thirdparty,t2,1,id3") //As defined in ThirdsServiceMock
        expect(rootElement.queryAll(By.css('li > div.nav-link > of-menu-link > div a > fa-icon')).length).toBe(1)
        expect(rootElement.queryAll(By.css('li > div.nav-link > of-menu-link > div a > fa-icon'))[0].parent.nativeElement.attributes['href'].value).toEqual("link3") //As defined in ThirdsServiceMock
    });

    it('should create menu', () => {
        defineFakeState(MODE.HAS_CONFIG_WITH_MENU);   

        const rootElement = fixture.debugElement;
        expect(component).toBeTruthy();
        expect( rootElement.queryAll(By.css('li.dropdown.thirds-dropdown')).length).toBe(1)
        expect( rootElement.queryAll(By.css('li.dropdown.thirds-dropdown > div a')).length).toBe(4) //Because there is now two <a> for each menu entry: text link and icon
        expect( rootElement.queryAll(By.css('li.dropdown.thirds-dropdown > div a'))[0].nativeElement.attributes['ng-reflect-router-link'].value).toEqual("/thirdparty,t1,1,id1") //As defined in ThirdsServiceMock
        expect( rootElement.queryAll(By.css('li.dropdown.thirds-dropdown > div a > fa-icon')).length).toBe(2)
        expect( rootElement.queryAll(By.css('li.dropdown.thirds-dropdown > div a > fa-icon'))[0].parent.nativeElement.attributes['href'].value).toEqual("link1") //As defined in ThirdsServiceMock
        expect( rootElement.queryAll(By.css('li.nav-item')).length).toBe(5)
    });

    it('should toggle menu ', (done) => {
        defineFakeState(MODE.HAS_CONFIG_WITH_MENU); 

        clock().install();
        const rootElement = fixture.debugElement;
        expect(component).toBeTruthy();
        expect( rootElement.queryAll(By.css('li.dropdown')).length).toBe(2);
        expect( rootElement.queryAll(By.css('li.dropdown > div'))[0].nativeElement
                .attributes['ng-reflect-collapsed'].value
            )
            .toBe('true');
        component.toggleMenu(0)
        fixture.detectChanges();
        expect( rootElement.queryAll(By.css('li.dropdown > div'))[0].nativeElement
                .attributes['ng-reflect-collapsed'].value
            ).toBe('false');
        clock().tick(6000);
        clock().uninstall();
        fixture.detectChanges();
        expect( rootElement.queryAll(By.css('li.dropdown > div'))[0].nativeElement
            .attributes['ng-reflect-collapsed'].value
        ).toBe('true');
        done();
    });


    function defineFakeState(mode:MODE): void {
        spyOn(store, 'select').and.callFake(buildFn => {
            if (buildFn === selectCurrentUrl) {
                return of('/test/url');
            } 

            switch (mode) {
            case MODE.HAS_NO_CONFIG:
                return of ({
                    ...emptyAppState,
                    authentication: { ...authInitialState },
                    settings: {...settingsInitialState },
                    menu: {...menuInitialState },
                    config: { ...configInitialState,
                            config: {
                                settings: "empty"
                            } 
                        }
                     
                }).pipe(
                    map(v => buildFn(v))
                )
                break;
            case MODE.HAS_CONFIG_WITH_MENU:
                return of ({
                    ...emptyAppState,
                    authentication: { ...authInitialState },
                    settings: {...settingsInitialState },
                    config: { ...configInitialState,
                        config: {
                            settings: "empty"
                        } 
                    }, 
                    menu: {
                        ...menuInitialState,
                        menu: [{
                        id: 't1',
                        version: '1',
                        label: 'tLabel1',
                        entries: [{
                            id: 'id1',
                            label: 'label1',
                            url: 'link1'
                        },{
                            id: 'id2',
                            label: 'label2',
                            url: 'link2'
                        }]
                        }, {
                        id: 't2',
                        version: '1',
                        label: 'tLabel2',
                        entries: [{
                            id: 'id3',
                            label: 'label3',
                            url: 'link3'
                        }]
                    }]},
                }).pipe(
                    map(v => buildFn(v))
                )
                break;
                case MODE.HAS_CONFIG_FOR_CONFIGURATION_WITH_LIMITSIZE_TRUE:
                    return of ({
                        ...emptyAppState,
                        authentication: { ...authInitialState },
                        settings: {...settingsInitialState },
                        menu: {...menuInitialState },
                        config: {...configInitialState,
                            config: {
                                settings : "empty",
                                logo: {
                                    base64: 'abcde64', 
                                    height: 64,
                                    width: 400,
                                    limitSize: true
                                }
                            }}
                    }).pipe(
                        map(v => buildFn(v))
                    )
                break;
                case MODE.HAS_CONFIG_FOR_CONFIGURATION_WITH_LIMITSIZE_FALSE:
                    return of ({
                        ...emptyAppState,
                        authentication: { ...authInitialState },
                        settings: {...settingsInitialState },
                        menu: {...menuInitialState },
                        config: {...configInitialState,
                            config: {
                                settings : "empty",
                                logo: {
                                    base64: 'abcde64', 
                                    height: 32,
                                    width: 200,
                                    limitSize: false
                                }
                            }}
                    }).pipe(
                        map(v => buildFn(v))
                    )
                break;
                case MODE.HAS_CONFIG_FOR_CONFIGURATION_WITH_LIMITSIZE_WRONG_VALUE:
                    return of ({
                        ...emptyAppState,
                        authentication: { ...authInitialState },
                        settings: {...settingsInitialState },
                        menu: {...menuInitialState },
                        config: {...configInitialState,
                            config: {
                                settings: "empty",
                                logo: {
                                    base64: 'abcde64', 
                                    height: 32,
                                    width: 200,
                                    limitSize: 'NEITHER_FALSE_NEITHER_TRUE'
                                }
                            }}
                    }).pipe(
                        map(v => buildFn(v))
                    )
                break;
                case MODE.HAS_CONFIG_FOR_CONFIGURATION_WITH_LIMITSIZE_NOT_DEFINED:
                    return of ({
                        ...emptyAppState,
                        authentication: { ...authInitialState },
                        settings: {...settingsInitialState },
                        menu: {...menuInitialState },
                        config: {...configInitialState,
                            config: {
                                settings: "empty",
                                logo: {
                                    base64: 'abcde64', 
                                    height: 16,
                                    width: 100
                                }
                            }}
                    }).pipe(
                        map(v => buildFn(v))
                    )
                break;            
            }
        });

        fixture.detectChanges();
    } // end function

});

