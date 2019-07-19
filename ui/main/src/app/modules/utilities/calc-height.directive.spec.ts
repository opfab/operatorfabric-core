/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {CalcHeightDirective} from "./calc-height.directive";
import {By} from "@angular/platform-browser";
import {ComponentFixture, TestBed } from '@angular/core/testing';
import {Component} from "@angular/core";

// Dummy component to test the directive (with parentId set)
//TODO Make heights random & handle case where there isn't enough space left (should return 0)
@Component(
    {
        selector: 'calc-height-directive-test-component',
        template: `
            <div id="testParentId" style="height: 500px">
                <div calcHeightDirective parentId="testParentId" fixedHeightClass="test-fixed-height-class" calcHeightClass="test-calc-height-class">
                    <div id="myFirstFixedHeightElem" class="test-fixed-height-class" style="height: 20px"></div>
                    <div id="mySecondFixedHeightElem" class="test-fixed-height-class" style="height: 30px"></div>
                    <div id="myCalcHeightElement" class="test-calc-height-class"></div>
                </div>
            </div>`
    }
)
class CalcHeightDirectiveTestComponent {}

describe('CalcHeightDirective', () => {

    let component: CalcHeightDirectiveTestComponent;
    let fixture: ComponentFixture<CalcHeightDirectiveTestComponent>;

    beforeEach(async () => {await TestBed.configureTestingModule(
        {
            declarations: [CalcHeightDirectiveTestComponent, CalcHeightDirective]
        }).compileComponents();
    });

    beforeEach(async () => {
        fixture = TestBed.createComponent(CalcHeightDirectiveTestComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create an instance', () => {
        const directive = new CalcHeightDirective(null);
        expect(directive).toBeTruthy();
    });

    it('should calc height of element correctly', async () => {
        await fixture.whenStable();
        //Test component should be created
        expect(component).toBeTruthy();
        //dom structure
        let debugElement = fixture.debugElement;
        expect(debugElement.query(By.css('#myCalcHeightElement'))).toBeTruthy();
        expect(debugElement.query(By.css('#myCalcHeightElement')).nativeElement.style.getPropertyValue("height")).toEqual('450px');;
    });
});
