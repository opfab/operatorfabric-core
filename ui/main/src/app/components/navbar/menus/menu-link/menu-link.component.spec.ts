import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuLinkComponent } from './menu-link.component';
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {RouterTestingModule} from "@angular/router/testing";
import {getOneRandomMenu} from "@tests/helpers";

describe('MenuLinkComponent', () => {
  let component: MenuLinkComponent;
  let fixture: ComponentFixture<MenuLinkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        FontAwesomeModule
      ],
      declarations: [ MenuLinkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuLinkComponent);
    component = fixture.componentInstance;
    component.menu = getOneRandomMenu();
    component.menuEntry = component.menu.entries[0];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
