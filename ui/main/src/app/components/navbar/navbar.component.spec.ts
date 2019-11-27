/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {NavbarComponent} from './navbar.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {RouterTestingModule} from '@angular/router/testing';
import {Store, StoreModule} from '@ngrx/store';
import {appReducer, AppState, storeConfig} from '@ofStore/index';
import {IconComponent} from "../icon/icon.component";
import {EffectsModule} from "@ngrx/effects";
import {MenuEffects} from "@ofEffects/menu.effects";
import {ThirdsService} from "@ofServices/thirds.service";
import {By} from "@angular/platform-browser";
import {ThirdsServiceMock} from "@tests/mocks/thirds.service.mock";
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {InfoComponent} from "./info/info.component";
import {TimeService} from "@ofServices/time.service";
import clock = jasmine.clock;
import { emptyAppState4Test } from '@tests/helpers';
import { configInitialState } from '@ofStore/states/config.state';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { menuInitialState } from '@ofStore/states/menu.state';
import { HttpClient, HttpHandler, HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { settingsInitialState } from '@ofStore/states/settings.state';
import { authInitialState } from '@ofStore/states/authentication.state';
import { time } from 'jasmine-marbles';
import { timeInitialState } from '@ofStore/states/time.state';
import { Component, ɵConsole } from '@angular/core';
import { selectCurrentUrl } from '@ofStore/selectors/router.selectors';


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
                FontAwesomeModule
            ],
            declarations: [NavbarComponent, IconComponent, InfoComponent],
            providers: [
                Store,
                ThirdsService, 
                TimeService]
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

    it('should create with a configuration no setted', () => {
        defineFakeState('HAS_NO_CONFIG');   

        expect(component).toBeTruthy();
        expect(component.customLogo).toBe(undefined);
        expect(component.height).toBe(undefined);
        expect(component.width).toBe(undefined);
        expect(component.limitSize).toBe(undefined);
    });

    it('should create with a configuration setted', () => {
        defineFakeState('HAS_CONFIG');   

        expect(component).toBeTruthy();
        expect(component.customLogo).toBe("data:image/svg+xml;base64,abcde64");
        expect(component.height).toBe("64px");
        expect(component.width).toBe("400px");
        expect(component.limitSize).toBe(true);
    });

    it('should create plain link for single-entry third-party menu', () => {
        defineFakeState('HAS_CONFIG');   

        const rootElement = fixture.debugElement;
        expect(component).toBeTruthy();
        expect(rootElement.queryAll(By.css('li > div.nav-link')).length).toBe(1)
        expect(rootElement.queryAll(By.css('li > div.nav-link > a')).length).toBe(2) //Because there is two <a> for each menu entry: text link and icon
        expect(rootElement.queryAll(By.css('li > div.nav-link > a'))[0].nativeElement.attributes['ng-reflect-router-link'].value).toEqual("/thirdparty,t2,1,id3") //As defined in ThirdsServiceMock
        expect(rootElement.queryAll(By.css('li > div.nav-link > a > fa-icon')).length).toBe(1)
        expect(rootElement.queryAll(By.css('li > div.nav-link > a > fa-icon'))[0].parent.nativeElement.attributes['href'].value).toEqual("link3") //As defined in ThirdsServiceMock
    });

    it('should create menu', () => {
        defineFakeState('HAS_CONFIG');   

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
        defineFakeState('HAS_CONFIG'); 

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


    function defineFakeState(mode:string): void {
        spyOn(store, 'select').and.callFake(buildFn => {
            if (buildFn === selectCurrentUrl) {
                return of('/test/url');
            } 

            if (mode === "HAS_NO_CONFIG") {
                return of ({
                    ...emptyAppState,
                    authentication: { ...authInitialState },
                    settings: {...settingsInitialState },
                    time: {...timeInitialState },
                    menu: {...menuInitialState },
                    config: { ...configInitialState } 
                }).pipe(
                    map(v => buildFn(v))
                )
            } else if (mode === "HAS_CONFIG") {
                return of ({
                    ...emptyAppState,
                    authentication: { ...authInitialState },
                    settings: {...settingsInitialState },
                    time: {...timeInitialState },
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
                    config: {
                    ...configInitialState,
                    config: {
                        logo: {
                        base64: 'abcde64', 
                        height: '64px',
                        width: '400px',
                        limitSize: true
                    }
                    }}
                }).pipe(
                    map(v => buildFn(v))
                )
            } // end if 
        });

        fixture.detectChanges();
    } // end function

});

