/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ArchivesComponent} from './archives.component';
import {appReducer, AppState, storeConfig} from '@ofStore/index';
import {Store, StoreModule} from '@ngrx/store';
import * as fromStore from '@ofStore/selectors/archive.selectors';
import {RouterTestingModule} from '@angular/router/testing';
import {RouterStateSerializer, StoreRouterConnectingModule} from '@ngrx/router-store';
import {CustomRouterStateSerializer} from '@ofStates/router.state';
import {TranslateModule} from '@ngx-translate/core';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {ServicesModule} from '@ofServices/services.module';
import {ArchiveQuerySuccess} from '@ofStore/actions/archive.actions';
import {ArchiveListComponent} from './components/archive-list/archive-list.component';
import {ArchiveFiltersComponent} from './components/archive-filters/archive-filters.component';
import {getRandomPage} from '@tests/helpers';
import {HttpClientTestingModule} from '@angular/common/http/testing';

describe('ArchivesComponent', () => {
    let component: ArchivesComponent;
    let store: Store<AppState>;
    let fixture: ComponentFixture<ArchivesComponent>;
    let compiled: any;
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                ServicesModule,
                StoreModule.forRoot(appReducer, storeConfig),
                RouterTestingModule,
                StoreRouterConnectingModule,
                HttpClientTestingModule,
                TranslateModule.forRoot()],
            declarations: [
                ArchivesComponent,
                ArchiveFiltersComponent,
                ArchiveListComponent
            ],
            providers: [
                {provide: Store, useClass: Store},
                {provide: RouterStateSerializer, useClass: CustomRouterStateSerializer}
            ],
            schemas: [ NO_ERRORS_SCHEMA ]
        }).compileComponents();
    }));
    beforeEach(() => {
        store = TestBed.get(Store);
        spyOn(store, 'dispatch').and.callThrough();
        // avoid exceptions during construction and init of the component
        // spyOn(store, 'pipe').and.callFake(() => of('/test/url'));
        fixture = TestBed.createComponent(ArchivesComponent);
        component = fixture.componentInstance;
        compiled = fixture.debugElement.nativeElement;
        fixture.detectChanges();

    });

    it('should create an the app-archives component', () => {
        expect(component).toBeTruthy();
    });
    it('should contains the of-archive-filters component', () => {
        expect(compiled.querySelector('of-archive-filters')).not.toBeNull();
    });
    it('should contains the app-archive-list component', () => {
        expect(compiled.querySelector('of-archive-list')).not.toBeNull();
    });
    it('should create an empty list in the app-archive-list component', () => {
        expect(compiled.querySelector('of-archive-list > .container-fluid > div')).toBeFalsy();
    });
    it('should create a list with one element when there are ' +
        'only one card in the state', () => {
        const resultPage = getRandomPage(1, 10);
        const action = new ArchiveQuerySuccess({resultPage});
        store.dispatch(action);
        // select the archive from the store
        const archive$ = store.select(fromStore.selectArchive);
        archive$.subscribe(archive => {
            expect(archive.resultPage).toEqual(resultPage);
        });
        expect(store.dispatch).toHaveBeenCalledWith(action);
    });
});
