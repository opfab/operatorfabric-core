

import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {Store} from "@ngrx/store";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {AppState} from "@ofStore/index";
import {of} from "rxjs";
import {settingsInitialState} from "@ofStates/settings.state";
import {map} from "rxjs/operators";
import {PatchSettings} from "@ofActions/settings.actions";
import {EmailSettingComponent} from "./email-setting.component";
import {emptyAppState4Test} from "@tests/helpers";
import createSpyObj = jasmine.createSpyObj;
import SpyObj = jasmine.SpyObj;
import {authInitialState} from "@ofStates/authentication.state";
import {configInitialState} from "@ofStates/config.state";

describe('EmailSettingComponent', () => {
    let component: EmailSettingComponent;
    let fixture: ComponentFixture<EmailSettingComponent>;
    let mockStore: SpyObj<Store<AppState>>;
    let emptyAppState: AppState = {
        ...emptyAppState4Test,
        authentication: {...authInitialState, identifier: 'test'},
        config: configInitialState
    };
    beforeEach(async(() => {
        const storeSpy = createSpyObj('Store', ['dispatch', 'select']);

        TestBed.configureTestingModule({
            imports: [
                FormsModule,
                ReactiveFormsModule,
            ],
            providers: [{provide: Store, useValue: storeSpy}],
            declarations: [EmailSettingComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        mockStore = TestBed.get(Store);
        mockStore.select.and.callFake(selector => {
            return of({
                ...emptyAppState, settings: {
                    ...settingsInitialState,
                    loaded: true,
                    settings: {
                        test: 'old.adress@test.org',
                        empty: null
                    }
                }
            }).pipe(
                map(v => selector(v))
            )
        });
        fixture = TestBed.createComponent(EmailSettingComponent);
        component = fixture.componentInstance;

    });

    it('should create', () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });
    it('should init', (done) => {
        component.settingPath = 'test';
        fixture.detectChanges();
        expect(component).toBeTruthy();
        setTimeout(() => {
            expect(component.form.get('setting').value).toEqual('old.adress@test.org');
            done();
        });
    });
    it('should submit', (done) => {
        component.settingPath = 'test';
        fixture.detectChanges();
        // const settingInput = fixture.debugElement.queryAll(By.css('input'))[0];
        // settingInput.nativeElement.value = 'new-value';
        component.form.get('setting').setValue('new.adress@test.org');
        setTimeout(() => {
            expect(mockStore.dispatch).toHaveBeenCalledTimes(1);
            const settings = {login: 'test'};
            settings[component.settingPath] = 'new.adress@test.org';
            expect(mockStore.dispatch).toHaveBeenCalledWith(new PatchSettings({settings: settings}));
            done();
        }, 1000);

    });

    it('should not submit with required validator', (done) => {
        component.settingPath = 'empty';
        component.requiredField = true;
        fixture.detectChanges();
        // const settingInput = fixture.debugElement.queryAll(By.css('input'))[0];
        // settingInput.nativeElement.value = 'new-value';
        component.form.get('setting').setValue('');
        setTimeout(() => {
            expect(mockStore.dispatch).toHaveBeenCalledTimes(0);
            done();
        }, 1000);

    });

    it('should not submit with pattern validator', (done) => {
        component.settingPath = 'empty';
        component.pattern = '.+@test.org';
        fixture.detectChanges();
        component.form.get('setting').setValue('john.doe@dummy.org');
        setTimeout(() => {
            expect(component.form.valid).toBeFalsy();
            expect(mockStore.dispatch).toHaveBeenCalledTimes(0);
            done();
        }, 1000);

    });

    it('should submit with pattern validator', (done) => {
        component.settingPath = 'empty';
        component.pattern = '.+@test.org';
        fixture.detectChanges();
        component.form.get('setting').setValue('john.doe@test.org');
        setTimeout(() => {
            expect(component.form.valid).toBeTruthy();
            expect(mockStore.dispatch).toHaveBeenCalledTimes(1);
            const settings = {login: 'test'};
            settings[component.settingPath] = 'john.doe@test.org';
            expect(mockStore.dispatch).toHaveBeenCalledWith(new PatchSettings({settings: settings}));
            done();
        }, 1000);

    });
});
