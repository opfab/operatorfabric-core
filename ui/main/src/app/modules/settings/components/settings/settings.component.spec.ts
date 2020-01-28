
import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {SettingsComponent} from './settings.component';
import {NO_ERRORS_SCHEMA} from "@angular/core";
import {By} from "@angular/platform-browser";
import {StoreModule} from "@ngrx/store";
import {appReducer} from "@ofStore/index";

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
        imports: [ StoreModule.forRoot(appReducer)],
      declarations: [ SettingsComponent ],
        schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(fixture.debugElement.queryAll(By.css('.col-md-6')).length).toEqual(8)
  });
});
