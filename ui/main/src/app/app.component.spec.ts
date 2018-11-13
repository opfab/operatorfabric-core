/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {async, TestBed} from '@angular/core/testing';
import {AppComponent} from './app.component';
import {RouterTestingModule} from '@angular/router/testing';
import {MatTabsModule, MatToolbarModule} from '@angular/material';
import {Store, StoreModule} from '@ngrx/store';
import {AppState} from '@state/app.interface';
import * as fromReducers from '@state/app.reducer';


fdescribe('AppComponent', () => {

    let store: Store<AppState>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                StoreModule.forRoot(fromReducers.appReducer),
                // solution 4 RouterTestingModule: https://github.com/coreui/coreui-free-bootstrap-admin-template/issues/202
                RouterTestingModule,
                MatTabsModule,
                MatToolbarModule
            ],
            declarations: [AppComponent],
            providers: [{provide: store, useClass: Store}]
        }).compileComponents();
    }));
    beforeEach(() => {
        store = TestBed.get(Store);
        spyOn(store, 'dispatch').and.callThrough();
    });

    it('should create the app', async(() => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.debugElement.componentInstance;
        expect(app).toBeTruthy();
    }));

    it(`should have as title 'Operator Fabric'`, async(() => {
      const fixture = TestBed.createComponent(AppComponent);
      const app = fixture.debugElement.componentInstance;
      expect(app.title).toEqual('Operator Fabric');
    }));

    xit('should render title in a h1 tag', async(() => {
      const fixture = TestBed.createComponent(AppComponent);
      fixture.detectChanges();
      const compiled = fixture.debugElement.nativeElement;
        const h1 = compiled.querySelector('h1');
        expect(h1).toBeTruthy();
        expect(h1.textContent).toContain('Welcome to ng-base-annotation-test!');
    }));
});
