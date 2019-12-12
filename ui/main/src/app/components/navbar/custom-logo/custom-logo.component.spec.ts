import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomLogoComponent } from './custom-logo.component';

describe('CustomLogoComponent', () => {
  let component: CustomLogoComponent;
  let fixture: ComponentFixture<CustomLogoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomLogoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomLogoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
