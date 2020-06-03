
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomLogoComponent } from './custom-logo.component';

describe('CustomLogoComponent', () => {
  let component: CustomLogoComponent;
  let fixture: ComponentFixture<CustomLogoComponent>;

  let fakeImageBase64: string;

  let randomUnderMaxheight: number;
  let randomUnderMaxWidth: number;

  let randomOverMaxHeight: number;
  let randomOverMaxWidth: number;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CustomLogoComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomLogoComponent);
    component = fixture.componentInstance;
    
    fakeImageBase64 = 'abcdeBase64';

    randomUnderMaxheight = Math.floor(Math.random() * component.MAX_HEIGHT);
    randomUnderMaxWidth = Math.floor(Math.random() * component.MAX_WIDTH);

    randomOverMaxHeight = component.MAX_HEIGHT + Math.floor(Math.random() * 100);
    randomOverMaxWidth = component.MAX_WIDTH + Math.floor(Math.random() * 400);
  });

  it('should create the custom-logo with default values', () => {

    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(component.base64).toBe(undefined);
    expect(component.limitSize).toBeTruthy(); // default value 
    expect(component.height).toBe(component.DEFAULT_HEIGHT);
    expect(component.width).toBe(component.DEFAULT_WIDTH);
  });

  // LIMITSIZE = TRUE
  it('[limitSize = true], should create the custom-logo with height and width defined under the limitSize', () => {

    component.base64 = fakeImageBase64;
    component.limitSize = true;
    component.height = randomUnderMaxheight;
    component.width = randomUnderMaxWidth;

    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(component.base64).toBe(fakeImageBase64);
    expect(component.limitSize).toBeTruthy();
    expect(component.height).toBe(randomUnderMaxheight);
    expect(component.width).toBe(randomUnderMaxWidth);
  });

  it('[limitSize = true], should create the custom-logo with height and width defined but redefined with the limitSize', () => {

    component.base64 = fakeImageBase64;
    component.limitSize = true;
    component.height = randomOverMaxHeight;
    component.width = randomOverMaxWidth;

    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(component.base64).toBe(fakeImageBase64);
    expect(component.limitSize).toBeTruthy();
    expect(component.height).toBe(component.MAX_HEIGHT);
    expect(component.width).toBe(component.MAX_WIDTH);
  });

  it('[limitSize = true], should create the custom-logo with height defined and width not defined, the width will be set to the DEFAULT_WIDTH value', () => {

    component.base64 = fakeImageBase64;
    component.limitSize = true;
    component.height = randomUnderMaxheight;

    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(component.base64).toBe(fakeImageBase64);
    expect(component.limitSize).toBeTruthy();
    expect(component.height).toBe(randomUnderMaxheight);
    expect(component.width).toBe(component.DEFAULT_WIDTH);
  });

  it('[limitSize = true], should create the custom-logo with width defined and height not defined, the height will be set to the DEFAULT_HEIGHT value', () => {

    component.base64 = fakeImageBase64;
    component.limitSize = true;
    component.width = randomUnderMaxWidth;

    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(component.base64).toBe(fakeImageBase64);
    expect(component.limitSize).toBeTruthy();
    expect(component.height).toBe(component.DEFAULT_HEIGHT);
    expect(component.width).toBe(randomUnderMaxWidth);
  });

  it('[limitSize = true], should create the custom-logo with width defined over the MAX_WIDTH and height not defined, the width will be set to MAX_WIDTH value and the height will be set to the DEFAULT_HEIGHT value', () => {

    component.base64 = fakeImageBase64;
    component.limitSize = true;
    component.width = randomOverMaxWidth;

    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(component.base64).toBe(fakeImageBase64);
    expect(component.limitSize).toBeTruthy();
    expect(component.height).toBe(component.DEFAULT_HEIGHT);
    expect(component.width).toBe(component.MAX_WIDTH);
  });

  // LIMITSIZE = FALSE
  it('[limitSize = false], should create the custom-logo with height and width defined, height and width are under the limitSize', () => {

    component.base64 = fakeImageBase64;
    component.limitSize = false;
    component.height = randomUnderMaxheight;
    component.width = randomUnderMaxWidth;

    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(component.base64).toBe(fakeImageBase64);
    expect(component.limitSize).toBeFalsy();
    expect(component.height).toBe(randomUnderMaxheight);
    expect(component.width).toBe(randomUnderMaxWidth);
  });

  it('[limitSize = false], should create the custom-logo with height and width defined, height and width are over the limitSize but are not affected', () => {

    component.base64 = fakeImageBase64;
    component.limitSize = false;
    component.height = randomOverMaxHeight;
    component.width = randomOverMaxWidth;

    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(component.base64).toBe(fakeImageBase64);
    expect(component.limitSize).toBeFalsy();
    expect(component.height).toBe(randomOverMaxHeight);
    expect(component.width).toBe(randomOverMaxWidth);
  });

  it('[limitSize = false], should create the custom-logo with height defined and width not defined, the width will be set to the DEFAULT_WIDTH value', () => {

    component.base64 = fakeImageBase64;
    component.limitSize = false;
    component.height = randomUnderMaxheight;

    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(component.base64).toBe(fakeImageBase64);
    expect(component.limitSize).toBeFalsy();
    expect(component.height).toBe(randomUnderMaxheight);
    expect(component.width).toBe(component.DEFAULT_WIDTH);
  });

  it('[limitSize = false], should create the custom-logo with width defined and height not defined, the height will be set to the DEFAULT_HEIGHT value', () => {

    component.base64 = fakeImageBase64;
    component.limitSize = false;
    component.width = randomUnderMaxWidth;

    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(component.base64).toBe(fakeImageBase64);
    expect(component.limitSize).toBeFalsy();
    expect(component.height).toBe(component.DEFAULT_HEIGHT);
    expect(component.width).toBe(randomUnderMaxWidth);
  });

  it('[limitSize = false], should create the custom-logo with width defined over the MAX_WIDTH and height not defined, the width is not affected by the limitSize and the height will be set to the DEFAULT_HEIGHT value', () => {

    component.base64 = fakeImageBase64;
    component.limitSize = false;
    component.width = randomOverMaxWidth;

    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(component.base64).toBe(fakeImageBase64);
    expect(component.limitSize).toBeFalsy();
    expect(component.height).toBe(component.DEFAULT_HEIGHT);
    expect(component.width).toBe(randomOverMaxWidth);
  });

});
