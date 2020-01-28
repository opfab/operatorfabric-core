
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IconComponent } from './icon.component';

describe('IconComponent', () => {
  let component: IconComponent;
  let fixture: ComponentFixture<IconComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [IconComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IconComponent);
    component = fixture.componentInstance;
  });

  it('should create, sizeIcon not defined, default size is set, W*H => 32px*32px', () => {
    component.icon = 'icon';
    fixture.detectChanges();
    expect(component).toBeTruthy();

    const htmlElement: HTMLElement = fixture.nativeElement;

    expect(htmlElement.querySelector('svg').getAttribute('width')).toEqual('32px');
    expect(htmlElement.querySelector('svg').getAttribute('height')).toEqual('32px');
    expect(htmlElement.querySelector('svg use').getAttribute('xlink:href'))
      .toEqual('/assets/images/icons/sprites.svg#icon');
  });

  it('should adjust attributes with big size', () => {
    component.sizeIcon = 'big';

    fixture.detectChanges();

    const htmlElement: HTMLElement = fixture.nativeElement;

    expect(htmlElement.querySelector('svg').getAttribute('width')).toEqual('64px');
    expect(htmlElement.querySelector('svg').getAttribute('height')).toEqual('64px');
  });

  it('should adjust attributes with medium size', () => {
    component.sizeIcon = 'medium';

    fixture.detectChanges();

    const htmlElement: HTMLElement = fixture.nativeElement;

    expect(htmlElement.querySelector('svg').getAttribute('width')).toEqual('32px');
    expect(htmlElement.querySelector('svg').getAttribute('height')).toEqual('32px');
  });

  it('should adjust attributes with small size', () => {
    component.sizeIcon = 'small';

    fixture.detectChanges();

    const htmlElement: HTMLElement = fixture.nativeElement;

    expect(htmlElement.querySelector('svg').getAttribute('width')).toEqual('16px');
    expect(htmlElement.querySelector('svg').getAttribute('height')).toEqual('16px');
  });

  it('should adjust attributes with default size if we put other value than {small,medium,big}', () => {
    component.sizeIcon = 'size_not_small_medium_big';

    fixture.detectChanges();

    const htmlElement: HTMLElement = fixture.nativeElement;

    expect(htmlElement.querySelector('svg').getAttribute('width')).toEqual('32px');
    expect(htmlElement.querySelector('svg').getAttribute('height')).toEqual('32px');
  });

  it('default color mode : should adjust attributes on the sprites.svg if bright is not set', () => {
    component.icon = 'icon';

    fixture.detectChanges();

    const htmlElement: HTMLElement = fixture.nativeElement;

    expect(htmlElement.querySelector('svg use').getAttribute('xlink:href'))
      .toEqual('/assets/images/icons/sprites.svg#icon');
  });

  it('default color mode : should adjust attributes on the sprites.svg if bright is set with wrong value (different from {light, dark})', () => {
    component.icon = 'icon';
    component.bright = 'wrong_parameter_not_dark_or_not_light';
    fixture.detectChanges();

    const htmlElement: HTMLElement = fixture.nativeElement;

    expect(htmlElement.querySelector('svg use').getAttribute('xlink:href'))
      .toEqual('/assets/images/icons/sprites.svg#icon');
  });

  it('mono-color mode : should adjust attributes with mono light on the sprites-mono.svg', () => {
    component.icon = 'icon';
    component.bright = 'light';

    fixture.detectChanges();

    const htmlElement: HTMLElement = fixture.nativeElement;

    expect(htmlElement.querySelector('svg use').getAttribute('xlink:href'))
      .toEqual('/assets/images/icons/sprites-mono.svg#icon');
    expect(htmlElement.querySelector('svg').getAttribute('class')).toEqual('light');
  });

  it('mono-color mode : should adjust attributes with mono dark on the sprites-mono.svg', () => {
    component.icon = 'icon';
    component.bright = 'dark';

    fixture.detectChanges();

    const htmlElement: HTMLElement = fixture.nativeElement;

    expect(htmlElement.querySelector('svg use').getAttribute('xlink:href'))
      .toEqual('/assets/images/icons/sprites-mono.svg#icon');
    expect(htmlElement.querySelector('svg').getAttribute('class')).toEqual('dark');
  });

});
