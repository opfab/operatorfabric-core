/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {async, ComponentFixture, inject, TestBed} from '@angular/core/testing';

import {NavbarComponent} from './navbar.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {RouterTestingModule} from '@angular/router/testing';
import {Location} from "@angular/common";
import {Store, StoreModule} from '@ngrx/store';
import {appReducer, AppState} from '@ofStore/index';
import {IconComponent} from "../icon/icon.component";
import {EffectsModule} from "@ngrx/effects";
import {MenuEffects} from "@ofEffects/menu.effects";
import {ThirdsService} from "@ofServices/thirds.service";
import {By} from "@angular/platform-browser";
import {ThirdsServiceMock} from "@tests/mocks/thirds.service.mock";
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import clock = jasmine.clock;
import {Router} from "@angular/router";
import {Component} from "@angular/core";

@Component({
    template: ''
})
class DummyComponent {
}

describe('NavbarComponent', () => {

    let store: Store<AppState>;

    let component: NavbarComponent;
    let fixture: ComponentFixture<NavbarComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [NgbModule.forRoot(),
                RouterTestingModule.withRoutes([
                    {
                        path: 'feed', component: DummyComponent
                    },
                    {
                        path: 'thirdparty', component: DummyComponent,
                    },
                    {path: '**', redirectTo: '/feed'}
                ]),
                StoreModule.forRoot(appReducer),
                EffectsModule.forRoot([MenuEffects]),
                FontAwesomeModule
            ],
            declarations: [NavbarComponent, IconComponent, DummyComponent],
            providers: [{provide: store, useClass: Store},
                {provide: ThirdsService, useClass: ThirdsServiceMock}]
        })
            .compileComponents();
        store = TestBed.get(Store);
        spyOn(store, 'dispatch').and.callThrough();
        // avoid exceptions during construction and init of the component
        spyOn(store, 'pipe').and.callThrough();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(NavbarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should create plain link for single-entry third-party menu', () => {
        const rootElement = fixture.debugElement;
        expect(component).toBeTruthy();
        expect(rootElement.queryAll(By.css('li > div.nav-link')).length).toBe(1)
        expect(rootElement.queryAll(By.css('li > div.nav-link > a')).length).toBe(2) //Because there is two <a> for each menu entry: text link and icon
        expect(rootElement.queryAll(By.css('li > div.nav-link > a > fa-icon')).length).toBe(1)
    });
    it('should create toggles', () => {
        const rootElement = fixture.debugElement;
        expect(component).toBeTruthy();
        expect( rootElement.queryAll(By.css('li.dropdown')).length).toBe(1)
        expect( rootElement.queryAll(By.css('li.dropdown > div a')).length).toBe(4) //Because there is now two <a> for each menu entry: text link and icon
        expect( rootElement.queryAll(By.css('li.dropdown > div a > fa-icon')).length).toBe(2)
        expect( rootElement.queryAll(By.css('li.nav-item')).length).toBe(4)
    });
    it('should toggle', (done) => {
        clock().install();
        const rootElement = fixture.debugElement;
        expect(component).toBeTruthy();
        expect( rootElement.queryAll(By.css('li.dropdown')).length).toBe(1);
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

    it('should navigate to thirdparty route when text link is clicked (single link)',
        async(inject([Router, Location], (router: Router, location: Location) => {
        const rootElement = fixture.debugElement;
        expect(component).toBeTruthy();
        rootElement.queryAll(By.css('li > div.nav-link > a'))[0].nativeElement.click();
        fixture.whenStable().then(() => {
            expect(location.path()).toEqual('/thirdparty');
        });
    })));

    it('should navigate to thirdparty route when text link is clicked (dropdown)',
        async(inject([Router, Location], (router: Router, location: Location) => {const rootElement = fixture.debugElement;
        expect(component).toBeTruthy();
        rootElement.queryAll(By.css('li.dropdown > div a'))[0].nativeElement.click();
        fixture.whenStable().then(() => {
            expect(location.path()).toEqual('/thirdparty');
        });
    })));
});
