import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuLinkComponent } from './menu-link.component';
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {RouterTestingModule} from "@angular/router/testing";
import {
  emptyAppState4Test,
  getOneRandomMenu
} from "@tests/helpers";
import {Store, StoreModule} from "@ngrx/store";
import {appReducer, AppState, storeConfig} from "@ofStore/index";
import {of} from "rxjs";
import {configInitialState} from "@ofStates/config.state";
import {map} from "rxjs/operators";
import {By} from "@angular/platform-browser";
import {library} from "@fortawesome/fontawesome-svg-core";
import {faExternalLinkAlt} from "@fortawesome/free-solid-svg-icons";

library.add(faExternalLinkAlt);

describe('MenuLinkComponent', () => {
  let component: MenuLinkComponent;
  let fixture: ComponentFixture<MenuLinkComponent>;
  let store: Store<AppState>;
  let emptyAppState: AppState = emptyAppState4Test;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        FontAwesomeModule,
        StoreModule.forRoot(appReducer, storeConfig)
      ],
      declarations: [ MenuLinkComponent ]
    })
        .compileComponents();
  }));

  beforeEach(() => {
    store = TestBed.get(Store);
    fixture = TestBed.createComponent(MenuLinkComponent);
    component = fixture.componentInstance;
    component.menu = getOneRandomMenu();
    component.menuEntry = component.menu.entries[0];
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create both text link and icon if configuration is BOTH', () => {
    defineFakeState('BOTH');
    expectBothTextAndIcon();
  });

  it('should create both text link and icon if configuration is missing', () => {
    defineFakeState(undefined);
    expectBothTextAndIcon();
  });

  it('should create both text link and icon if configuration is incorrect', () => {
    defineFakeState('INCORRECT_CONFIG_VALUE');
    expectBothTextAndIcon();
  });

  it('should create only text link that opens in tab if configuration is TAB', () => {
    defineFakeState('TAB');
    const rootElement = fixture.debugElement;
    // Tests on text link
    expect(rootElement.queryAll(By.css('div > a.text-link')).length).toBe(1);
    expect(rootElement.queryAll(By.css('div > a.text-link'))[0].nativeElement.attributes['href'].value).toEqual(component.menuEntry.url);
    expect(rootElement.queryAll(By.css('div > a.text-link'))[0].nativeElement.attributes['target'].value).toEqual('_blank');
    expect(rootElement.queryAll(By.css('div > a.text-link'))[0].nativeElement.attributes['routerLink']).toBeUndefined();

    // No icon
    expect(rootElement.queryAll(By.css('div > a.icon-link')).length).toBe(0);
  });

  it('should create only text link that opens in iframe if configuration is IFRAME', () => {
    defineFakeState('IFRAME');
    expectIframeTextLink();

    // No icon
    const rootElement = fixture.debugElement;
    expect(rootElement.queryAll(By.css('div > a.icon-link')).length).toBe(0);
  });

  function expectIframeTextLink(): void {

    const rootElement = fixture.debugElement;
    // Tests on text link
    expect(rootElement.queryAll(By.css('div > a.text-link')).length).toBe(1);
    expect(rootElement.queryAll(By.css('div > a.text-link'))[0].nativeElement.attributes['href'].value)
        .toEqual(encodeURI("/thirdparty/"+component.menu.id+"/"+component.menu.version+"/"+component.menuEntry.id));
    expect(rootElement.queryAll(By.css('div > a.text-link'))[0].nativeElement.attributes['target']).toBeUndefined();
  }

  function expectBothTextAndIcon(): void {
    const rootElement = fixture.debugElement;

    expectIframeTextLink()

    // Tests on icon link
    expect(rootElement.queryAll(By.css('div > a.icon-link')).length).toBe(1);
    expect(rootElement.queryAll(By.css('div > a.icon-link'))[0].nativeElement.attributes['href'].value).toEqual(component.menuEntry.url);
    expect(rootElement.queryAll(By.css('div > a.icon-link'))[0].nativeElement.attributes['target'].value).toEqual('_blank');
    expect(rootElement.queryAll(By.css('div > a.icon-link'))[0].nativeElement.attributes['routerLink']).toBeUndefined();
  }

  function defineFakeState(thirdmenusType : string): void {
    spyOn(store, 'select').and.callFake(buildFn =>
    {
      if(!thirdmenusType) {
        return of (            {...emptyAppState,
              config: {
                ...configInitialState}
            }
        );
      } else {
        return of({
              ...emptyAppState,
              config: {
                ...configInitialState,
                config: {
                  navbar:
                      {
                        thirdmenus: {
                          type: thirdmenusType
                        }
                      }
                }
              }
            }
        ).pipe(
            map(v => buildFn(v))
        )}

    }  );
    fixture.detectChanges();
  }

});
