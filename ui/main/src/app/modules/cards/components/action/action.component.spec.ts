import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ActionComponent} from './action.component';
import {NgbModule} from "@ng-bootstrap/ng-bootstrap";
import {CommonModule} from "@angular/common";
import {TranslateLoader, TranslateModule} from "@ngx-translate/core";
import {UtilitiesModule} from "../../../utilities/utilities.module";
import {ThirdsI18nLoaderFactory, ThirdsService} from "@ofServices/thirds.service";

fdescribe('ActionComponent', () => {
  let component: ActionComponent;
  let fixture: ComponentFixture<ActionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports:[NgbModule,
        CommonModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: ThirdsI18nLoaderFactory,
            deps: [ThirdsService]
          },
          useDefaultLang: false
        }),
        UtilitiesModule],
      declarations: [ ActionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
