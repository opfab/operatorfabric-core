
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckboxSettingComponent } from './checkbox-setting.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {TranslateModule} from "@ngx-translate/core";
import {StoreModule} from "@ngrx/store";
import {appReducer, storeConfig} from "@ofStore/index";

describe('CheckboxSettingComponent', () => {
  let component: CheckboxSettingComponent;
  let fixture: ComponentFixture<CheckboxSettingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule,
        ReactiveFormsModule,
        TranslateModule.forRoot(),
        StoreModule.forRoot(appReducer, storeConfig)
      ],
      declarations: [ CheckboxSettingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckboxSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
