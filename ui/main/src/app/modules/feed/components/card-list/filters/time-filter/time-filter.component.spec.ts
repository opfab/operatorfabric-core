/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


import {async, ComponentFixture, TestBed ,flush , fakeAsync} from '@angular/core/testing';

import {TimeFilterComponent} from './time-filter.component';
import {NgbModule} from "@ng-bootstrap/ng-bootstrap";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {Store, StoreModule} from "@ngrx/store";
import {appReducer, AppState, storeConfig} from "@ofStore/index";
import {FilterType} from "@ofServices/filter.service";
import {ApplyFilter} from "@ofActions/feed.actions";
import {ServicesModule} from "@ofServices/services.module";
import {By} from "@angular/platform-browser";
import {I18nService} from "@ofServices/i18n.service";
import {TranslateModule} from "@ngx-translate/core";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {AuthenticationImportHelperForSpecs} from "@ofServices/authentication/authentication.service.spec";
import {FontAwesomeIconsModule} from "../../../../../utilities/fontawesome-icons.module";
import { FlatpickrModule } from 'angularx-flatpickr';
import * as moment from 'moment-timezone';

describe('TimeFilterComponent', () => {
    let component: TimeFilterComponent;
    let fixture: ComponentFixture<TimeFilterComponent>;
    let store: Store<AppState>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                NgbModule.forRoot(),
                FormsModule,
                ReactiveFormsModule,
                TranslateModule.forRoot(),
                StoreModule.forRoot(appReducer, storeConfig),
                FontAwesomeIconsModule,
                ServicesModule,
                HttpClientTestingModule,
                FlatpickrModule.forRoot()
            ],
            declarations: [TimeFilterComponent],
            providers:[ I18nService,
                {provide: 'TimeEventSource', useValue: null},
                AuthenticationImportHelperForSpecs]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        store = TestBed.get(Store);
        TestBed.get(I18nService).changeLocale('fr','Europe/Paris');
        spyOn(store, 'dispatch').and.callThrough();
        fixture = TestBed.createComponent(TimeFilterComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should update filter on state change', fakeAsync(() =>  {

        const start = moment();
        const end = moment().add('month',1);
        store.dispatch(new ApplyFilter({
            name: FilterType.TIME_FILTER,
            active: true,
            status: {
                start: start.valueOf(),
                end: end.valueOf(),
            }}));
        let debugElement = fixture.debugElement;
         //dom interraction
        debugElement.queryAll(By.css('.btn'))[0].triggerEventHandler('click', null);
        fixture.detectChanges();

        flush();
        const inputStart = debugElement.query(By.css('#startDateInput'));
        expect(inputStart.nativeElement.value).toContain(start.format('YYYY-MM-DD')); 
        const inputEnd = debugElement.query(By.css('#endDateInput'));
        expect(inputEnd.nativeElement.value).toContain(end.format('YYYY-MM-DD'));
        const timeStart = debugElement.query(By.css('#startTimeInput'));
        expect(timeStart.nativeElement.value).toContain(start.format('HH:mm')); 
        const timeEnd = debugElement.query(By.css('#endTimeInput'));
        expect(timeEnd.nativeElement.value).toContain(end.format('HH:mm'));

    }));

    it('should display popover', () => {
        //componenet state
        expect(component).toBeTruthy();
        //dom structure
        let debugElement = fixture.debugElement;
        //dom interraction
        debugElement.queryAll(By.css('.btn'))[0].triggerEventHandler('click', null);
        fixture.detectChanges();
        let formQuery = [...new Set(debugElement.queryAll(By.css('#start')))];
        let formLabelQuery = [...new Set(debugElement.queryAll(By.css('#start > label')))];
        let inputTextQuery = [...new Set(debugElement.queryAll(By.css("input[type=text]")))];
        expect(formQuery).toBeTruthy();
        expect(formQuery.length).toBe(1);
        expect(formLabelQuery).toBeTruthy();
        expect(inputTextQuery.length).toBe(4);
    });

});
