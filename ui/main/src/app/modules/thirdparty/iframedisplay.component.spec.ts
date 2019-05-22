/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IframeDisplayComponent } from './iframedisplay.component';
import {By, DomSanitizer} from "@angular/platform-browser";
import {root} from "rxjs/internal-compatibility";
import {DomSanitizerImpl} from "@angular/platform-browser/src/security/dom_sanitization_service";
import {readPatchedData} from "@angular/core/src/render3/util";

describe('IframeDisplayComponent', () => {
  let component: IframeDisplayComponent;
  let fixture: ComponentFixture<IframeDisplayComponent>;
  let sanitizer: DomSanitizer;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [IframeDisplayComponent]
    })
        .compileComponents();
    sanitizer= TestBed.get(DomSanitizer);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IframeDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    sanitizer= TestBed.get(DomSanitizer);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display message if navigated to when no url has been selected', () => {
    expect(component.iframeURL).toBeFalsy();
    const rootElement = fixture.nativeElement;
    expect(rootElement.children.length).toBe(1);
    expect(rootElement.children[0].localName).toEqual('p');
  });

  it('should display iframe with selected url', () => {
    //Initial state
    expect(component.iframeURL).toBeFalsy();
    expect(component).toBeTruthy();
    const rootElement = fixture.nativeElement;
    expect(rootElement.children.length).toBe(1);
    expect(rootElement.children[0].localName).toEqual('p');

    //Set new URL
    const newUrl = "myURL";
    const safeNewUrl = sanitizer.bypassSecurityTrustResourceUrl(newUrl);
    component.setUrl(safeNewUrl);
    fixture.detectChanges();

    expect(component.iframeURL).toEqual(safeNewUrl);
    expect(rootElement.children.length).toBe(1);
    expect(rootElement.children[0].children[0].localName).toEqual('iframe');
    expect(rootElement.children[0].children[0].attributes['src'].value).toEqual('myURL');
  });

  it('should update selected url', () => {
    //Initial state
    expect(component.iframeURL).toBeFalsy();
    expect(component).toBeTruthy();
    const rootElement = fixture.nativeElement;
    expect(rootElement.children.length).toBe(1);
    expect(rootElement.children[0].localName).toEqual('p');

    //Set new URL
    const newUrl1 = "myURL1";
    const safeNewUrl1 = sanitizer.bypassSecurityTrustResourceUrl(newUrl1);
    component.setUrl(safeNewUrl1);
    fixture.detectChanges();

    expect(component.iframeURL).toEqual(safeNewUrl1);
    expect(rootElement.children.length).toBe(1);
    expect(rootElement.children[0].children[0].localName).toEqual('iframe');
    expect(rootElement.children[0].children[0].attributes['src'].value).toEqual('myURL1');

    //Update URL
    const newUrl2 = "myURL2";
    const safeNewUrl2 = sanitizer.bypassSecurityTrustResourceUrl(newUrl2);
    component.setUrl(safeNewUrl2);
    fixture.detectChanges();

    expect(component.iframeURL).toEqual(safeNewUrl2);
    expect(rootElement.children.length).toBe(1);
    expect(rootElement.children[0].children[0].localName).toEqual('iframe');
    expect(rootElement.children[0].children[0].attributes['src'].value).toEqual('myURL2');
  });

});
