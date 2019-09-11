/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {IconComponent} from './icon.component';

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
          .toEqual('/assets/images/icons/sprites.svg#icon');
  });

  it('should create custom logo', () => {
    const base64code = "PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pg0KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjAuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPg0KPHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJDYXBhXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB2aWV3Qm94PSIwIDAgNTggNTgiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDU4IDU4OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+DQo8Y2lyY2xlIHN0eWxlPSJmaWxsOiM1NTYwODA7IiBjeD0iMjkiIGN5PSIyOSIgcj0iMjkiLz4NCjxnPg0KCTxwYXRoIHN0eWxlPSJmaWxsOiMyNkI5OUE7IiBkPSJNMjUuNTU2LDUuNTY4Yy0yLjE0My0wLjQxMi0zLjEyNS0yLjkxNi0xLjgzNS00LjY3NWwwLjM0Mi0wLjQ2Ng0KCQljLTIuODc5LDAuNDk0LTUuNjEsMS40MTctOC4xMzMsMi42OTJDMTcuNjg4LDMuNTQxLDE5LDUuMTEyLDE5LDdjMCwyLjIwOS0xLjc5MSw0LTQsNHMtNC0xLjc5MS00LTQNCgkJYzAtMC4yNzEsMC4wMjgtMC41MzYsMC4wOC0wLjc5MmMxLjExLTAuODc0LTIuMTY3LDEuNTk4LTQuMzc1LDQuMjQ5YzAuNDU3LDAuOTEsMC40NjUsMi4wNDEtMC4xODIsMi45OTRsLTAuODI1LDEuMjE3bDEuOTU4LDEuOTU4DQoJCWwxLjIzNi0wLjkwNmMxLjc2LTEuMjksNC4yNjMtMC4zMDgsNC42NzUsMS44MzVMMTMuODQ2LDE5aDIuNzY5bDAuMTY0LTEuMDY2YzAuMzM5LTIuMjA0LDIuODk2LTMuMjYzLDQuNjk0LTEuOTQ0bDAuODY5LDAuNjM3DQoJCWwxLjk1OC0xLjk1OGwtMC44MjUtMS4yMTdjLTEuMjI0LTEuODA3LTAuMTQ4LTQuMjcyLDIuMDA4LTQuNjA0TDI3LDguNjE1VjUuODQ2TDI1LjU1Niw1LjU2OHoiLz4NCjwvZz4NCjxnPg0KCTxwYXRoIHN0eWxlPSJmaWxsOiM0MjRBNjA7IiBkPSJNNDksNDQuNWMwLTMuMDM4LDIuNDYyLTUuNSw1LjUtNS41YzAuNTY1LDAsMS4xMDksMC4wODYsMS42MjIsMC4yNDQNCgkJYzAuNjItMS42NDIsMS4xMDItMy4zNTMsMS40MTgtNS4xMjJjLTAuNjI4LTAuNTQ1LTEuMDg3LTEuMzA1LTEuMjI5LTIuMjI4TDU2LjAxOSwzMGgtMy40NjJsLTAuNDQ4LDIuMzMxDQoJCWMtMC41MDQsMi42MTktMy41MjIsMy44Ny01LjczMSwyLjM3NGwtMS45NjUtMS4zMzFsLTIuNDQ4LDIuNDQ4bDEuMTMzLDEuNTQ1YzEuNjEzLDIuMTk5LDAuMzg1LDUuMzI5LTIuMjk0LDUuODQ0TDM5LDQzLjU1OHYzLjQ2Mg0KCQlsMS44OTQsMC4yOTFjMi42OTYsMC40MTUsNC4wNCwzLjQ5NywyLjUxLDUuNzU1bC0xLjAzMSwxLjUyMWwwLjA5NSwwLjA5NWMzLjA3Mi0xLjYxNSw1LjgxMS0zLjc3LDguMTA4LTYuMzMNCgkJQzQ5LjYwMiw0Ny4zNTksNDksNDYsNDksNDQuNXoiLz4NCjwvZz4NCjxwYXRoIHN0eWxlPSJmaWxsOiNFN0VDRUQ7IiBkPSJNNTIuODk5LDIzLjQ4NWMtMC4wMTEtMC4wMTEtMC4wMjYtMC4wMTQtMC4wMzgtMC4wMjVjMS4zOTMtMS42MjMsMi4zOTUtMy41OTEsMi44NTQtNS43NjENCgljLTIuOTM1LTYuOTI5LTguNDg2LTEyLjQ4LTE1LjQxNS0xNS40MTVjLTIuMTcsMC40NTgtNC4xMzgsMS40NjEtNS43NjEsMi44NTRjLTAuMDEtMC4wMTEtMC4wMTQtMC4wMjYtMC4wMjUtMC4wMzhsLTEuNDE0LTEuNDE0DQoJYy0wLjM5MS0wLjM5MS0xLjAyMy0wLjM5MS0xLjQxNCwwcy0wLjM5MSwxLjAyMywwLDEuNDE0bDEuNDE0LDEuNDE0YzAuMDEyLDAuMDEyLDAuMDI5LDAuMDE2LDAuMDQxLDAuMDI3DQoJYy0xLjc1MiwyLjAzOS0yLjg4Myw0LjYyMy0zLjA5OCw3LjQ2N0MzMC4wMjgsMTQuMDA4LDMwLjAxNSwxNCwzMCwxNGgtMmMtMC41NTIsMC0xLDAuNDQ3LTEsMXMwLjQ0OCwxLDEsMWgyDQoJYzAuMDE4LDAsMC4wMzItMC4wMDksMC4wNS0wLjAxYzAuMjE1LDIuODQ0LDEuMzM5LDUuNDI5LDMuMDkxLDcuNDY5Yy0wLjAxMiwwLjAxMS0wLjAyOCwwLjAxNS0wLjA0LDAuMDI3bC0xLjQxNCwxLjQxNA0KCWMtMC4zOTEsMC4zOTEtMC4zOTEsMS4wMjMsMCwxLjQxNGMwLjE5NSwwLjE5NSwwLjQ1MSwwLjI5MywwLjcwNywwLjI5M3MwLjUxMi0wLjA5OCwwLjcwNy0wLjI5M2wxLjQxNC0xLjQxNA0KCWMwLjAxMi0wLjAxMiwwLjAxNi0wLjAyOCwwLjAyNy0wLjA0YzIuMDM5LDEuNzUxLDQuNjI1LDIuODc2LDcuNDY5LDMuMDkxQzQyLjAwOSwyNy45NjgsNDIsMjcuOTgyLDQyLDI4djJjMCwwLjU1MywwLjQ0OCwxLDEsMQ0KCXMxLTAuNDQ3LDEtMXYtMmMwLTAuMDE2LTAuMDA4LTAuMDI4LTAuMDA5LTAuMDQ0YzIuODQ0LTAuMjE1LDUuNDI4LTEuMzQ2LDcuNDY3LTMuMDk4YzAuMDExLDAuMDEyLDAuMDE1LDAuMDI5LDAuMDI3LDAuMDQxDQoJbDEuNDE0LDEuNDE0YzAuMTk1LDAuMTk1LDAuNDUxLDAuMjkzLDAuNzA3LDAuMjkzczAuNTEyLTAuMDk4LDAuNzA3LTAuMjkzYzAuMzkxLTAuMzkxLDAuMzkxLTEuMDIzLDAtMS40MTRMNTIuODk5LDIzLjQ4NXogTTQzLDE4DQoJYy0xLjY1NywwLTMtMS4zNDMtMy0zczEuMzQzLTMsMy0zczMsMS4zNDMsMywzUzQ0LjY1NywxOCw0MywxOHoiLz4NCjxjaXJjbGUgc3R5bGU9ImZpbGw6I0U3RUNFRDsiIGN4PSIxOCIgY3k9IjQwIiByPSIzIi8+DQo8cGF0aCBzdHlsZT0iZmlsbDojRUJCQTE2OyIgZD0iTTM2LjQwNiw0Ny4wODZsLTIuNDczLTEuMDk5Yy0wLjAwNy0wLjAwMy0wLjAxNC0wLjAwMi0wLjAyLTAuMDA0QzM0LjYxNSw0NC4xMjMsMzUsNDIuMTA3LDM1LDQwDQoJYzAtMS44MjMtMC4yOTQtMy41NzYtMC44MjUtNS4yMjJjMC4wMDctMC4wMDIsMC4wMTMtMC4wMDEsMC4wMi0wLjAwNGwyLjE2Ny0wLjg0M2MwLjUxNS0wLjIsMC43Ny0wLjc3OSwwLjU3LTEuMjk0DQoJYy0wLjItMC41MTUtMC43NzctMC43NzItMS4yOTQtMC41NjlsLTIuMTY3LDAuODQzYy0wLjAxLDAuMDA0LTAuMDE2LDAuMDEyLTAuMDI2LDAuMDE2Yy0xLjU4NC0zLjQ1My00LjI4My02LjI4MS03LjY0Ni04LjAyMg0KCWMwLjAwNS0wLjAxLDAuMDEyLTAuMDE2LDAuMDE3LTAuMDI2bDEuMDk5LTIuNDczYzAuMjI0LTAuNTA1LTAuMDAzLTEuMDk2LTAuNTA4LTEuMzJjLTAuNTA1LTAuMjIzLTEuMDk1LDAuMDA0LTEuMzIsMC41MDgNCglsLTEuMDk5LDIuNDczYy0wLjAwNSwwLjAxMi0wLjAwMywwLjAyNC0wLjAwOCwwLjAzNkMyMi4xMTcsMjMuNDAxLDIwLjEwOCwyMywxOCwyM2MtMS44MjUsMC0zLjU3NCwwLjMwMy01LjIyLDAuODM1DQoJYy0wLjAwMy0wLjAxLTAuMDAxLTAuMDItMC4wMDUtMC4wM2wtMC44NDMtMi4xNjhjLTAuMi0wLjUxNS0wLjc4MS0wLjc3MS0xLjI5NC0wLjU2OWMtMC41MTUsMC4xOTktMC43NywwLjc3OS0wLjU3LDEuMjk0DQoJbDAuODQzLDIuMTY4YzAuMDAzLDAuMDA5LDAuMDEsMC4wMTUsMC4wMTQsMC4wMjRjLTMuNDY4LDEuNTk2LTYuMjk3LDQuMzI2LTguMDMxLDcuNzE3Yy0wLjAxNS0wLjAwNy0wLjAyNC0wLjAyMS0wLjA0LTAuMDI4DQoJbC0yLjEyOS0wLjkzN2MtMC4yMDctMC4wOTEtMC40MjQtMC4wODktMC42MjktMC4wNDFjMC4wNTMsMC42ODksMC4xMjQsMS4zNzMsMC4yMjUsMi4wNDhsMS43MjcsMC43Ng0KCWMwLjAxNCwwLjAwNiwwLjAzLDAuMDA0LDAuMDQ0LDAuMDA5Yy0wLjM4OSwxLjA0Ny0wLjY4OCwyLjEzNy0wLjg2NiwzLjI3bDAsMC4wMDFjMC4zNDMsMS4xNDIsMC43NTYsMi4yNTMsMS4yMzEsMy4zMzENCgljMC4wMjIsMC4wNDksMC4wNDQsMC4wOTcsMC4wNjYsMC4xNDZjMC4yMTcsMC40ODYsMC40NDgsMC45NjQsMC42OTEsMS40MzZjMC4wMjYsMC4wNSwwLjA1MSwwLjEwMSwwLjA3NywwLjE1MQ0KCWMwLjgwNCwxLjUzOCwxLjc0MywyLjk5NSwyLjgsNC4zNTVjMC4wNDEsMC4wNTIsMC4wODIsMC4xMDUsMC4xMjQsMC4xNTdjMC4zMjksMC40MTcsMC42NjgsMC44MjYsMS4wMTksMS4yMjQNCgljMC4wMjQsMC4wMjcsMC4wNDcsMC4wNTUsMC4wNzEsMC4wODJjMC43NjksMC44NjcsMS41OSwxLjY4OCwyLjQ1NywyLjQ1N2MwLjAyNywwLjAyNCwwLjA1NSwwLjA0NywwLjA4MiwwLjA3MQ0KCWMwLjM5OCwwLjM1MSwwLjgwNywwLjY5LDEuMjI0LDEuMDE5YzAuMDUyLDAuMDQyLDAuMTA1LDAuMDgzLDAuMTU3LDAuMTI0YzEuMzYsMS4wNTcsMi44MTcsMS45OTYsNC4zNTUsMi44DQoJYzAuMDUsMC4wMjYsMC4xMDEsMC4wNTIsMC4xNTEsMC4wNzhjMC40NzEsMC4yNDMsMC45NSwwLjQ3MywxLjQzNSwwLjY5YzAuMDQ5LDAuMDIyLDAuMDk3LDAuMDQ0LDAuMTQ2LDAuMDY2DQoJYzEuMDc4LDAuNDc1LDIuMTg5LDAuODg4LDMuMzMxLDEuMjMxbDAuMDAyLDBjMC44NjItMC4xMzUsMS42OTYtMC4zNDgsMi41MS0wLjYwN2MwLjAwNiwwLjAxNywwLjAwMiwwLjAzNSwwLjAwOSwwLjA1MmwwLjQ5MywxLjI4Mg0KCWMwLjc0OCwwLjEzOSwxLjUwNSwwLjI1NiwyLjI3MiwwLjMzNkwyNS4wMzMsNTUuNWMtMC4wMDUtMC4wMTItMC4wMTUtMC4wMi0wLjAyLTAuMDMyYzMuNDgyLTEuNTc3LDYuMzI2LTQuMjk2LDguMDc5LTcuNjc0DQoJYzAuMDExLDAuMDA2LDAuMDE4LDAuMDE2LDAuMDI5LDAuMDIxbDIuNDczLDEuMDk5QzM1LjcyNiw0OC45NzMsMzUuODY0LDQ5LDM2LDQ5YzAuMzgzLDAsMC43NDktMC4yMjIsMC45MTUtMC41OTQNCglDMzcuMTM4LDQ3LjkwMSwzNi45MTEsNDcuMzExLDM2LjQwNiw0Ny4wODZ6IE0xOCw0N2MtMy44NjYsMC03LTMuMTM0LTctN3MzLjEzNC03LDctN3M3LDMuMTM0LDcsN1MyMS44NjYsNDcsMTgsNDd6Ii8+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8L3N2Zz4NCg=="
    component.base64 = `data:image/svg+xml;base64,${base64code}`;
    component.big = true;
    fixture.detectChanges();
    const htmlElement: HTMLElement = fixture.nativeElement;
    expect(htmlElement.querySelector('img').getAttribute('width')).toEqual('64px');
    expect(htmlElement.querySelector('img').getAttribute('height')).toEqual('64px');

  })
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
            .toEqual('/assets/images/icons/sprites-mono.svg#icon');
        expect(htmlElement.querySelector('svg').getAttribute('class')).toEqual('light');
    });

    it('should adjust attributes with mono dark', () => {
        component.dark = true;
        component.icon = 'icon';
        fixture.detectChanges();
        const htmlElement: HTMLElement = fixture.nativeElement;
        expect(htmlElement.querySelector('svg use').getAttribute('xlink:href'))
            .toEqual('/assets/images/icons/sprites-mono.svg#icon');
        expect(htmlElement.querySelector('svg').getAttribute('class')).toEqual('dark');
    });

});
