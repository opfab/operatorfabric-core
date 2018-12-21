/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IconComponent } from './icon.component';

describe('IconComponent', () => {
  let component: IconComponent;
  let fixture: ComponentFixture<IconComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IconComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IconComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.icon = 'icon';
    fixture.detectChanges();
    expect(component).toBeTruthy();
      const htmlElement: HTMLElement = fixture.nativeElement;
      expect(htmlElement.querySelector('svg').getAttribute('width')).toEqual('16px');
      expect(htmlElement.querySelector('svg').getAttribute('height')).toEqual('16px');
      expect(htmlElement.querySelector('svg use').getAttribute('xlink:href'))
          .toEqual('assets/images/icons/sprites.svg#icon');
  });
  it('should adjust attributes with big size', () => {
      component.big = true;
      fixture.detectChanges();
      const htmlElement: HTMLElement = fixture.nativeElement;
      expect(htmlElement.querySelector('svg').getAttribute('width')).toEqual('64px');
      expect(htmlElement.querySelector('svg').getAttribute('height')).toEqual('64px');
  });
    it('should adjust attributes with medium size', () => {
        component.medium = true;
        fixture.detectChanges();
        const htmlElement: HTMLElement = fixture.nativeElement;
        expect(htmlElement.querySelector('svg').getAttribute('width')).toEqual('32px');
        expect(htmlElement.querySelector('svg').getAttribute('height')).toEqual('32px');
    });
    it('should adjust attributes with small size', () => {
        component.small = true;
        fixture.detectChanges();
        const htmlElement: HTMLElement = fixture.nativeElement;
        expect(htmlElement.querySelector('svg').getAttribute('width')).toEqual('16px');
        expect(htmlElement.querySelector('svg').getAttribute('height')).toEqual('16px');
    });

    it('should adjust attributes with mono light', () => {
        component.light = true;
        component.icon = 'icon';
        fixture.detectChanges();
        const htmlElement: HTMLElement = fixture.nativeElement;
        expect(htmlElement.querySelector('svg use').getAttribute('xlink:href'))
            .toEqual('assets/images/icons/sprites-mono.svg#icon');
        expect(htmlElement.querySelector('svg').getAttribute('class')).toEqual('light');
    });

    it('should adjust attributes with mono dark', () => {
        component.dark = true;
        component.icon = 'icon';
        fixture.detectChanges();
        const htmlElement: HTMLElement = fixture.nativeElement;
        expect(htmlElement.querySelector('svg use').getAttribute('xlink:href'))
            .toEqual('assets/images/icons/sprites-mono.svg#icon');
        expect(htmlElement.querySelector('svg').getAttribute('class')).toEqual('dark');
    });

});
