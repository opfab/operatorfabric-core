

import {CalcHeightDirective} from "./calc-height.directive";
import {By} from "@angular/platform-browser";
import {ComponentFixture, TestBed } from '@angular/core/testing';
import {AfterViewInit, Component} from "@angular/core";

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
class CalcHeightDirectiveTestComponent implements AfterViewInit{

    ngAfterViewInit() {

        //Trigger resize event to make sure that height is calculated once parent height is available (see OC-362)
        if (typeof(Event) === 'function') {
            // modern browsers
            window.dispatchEvent(new Event('resize'));
        } else {
            // for IE and other old browsers
            // causes deprecation warning on modern browsers
            var evt = window.document.createEvent('UIEvents');
            evt.initUIEvent('resize', true, false, window, 0);
            window.dispatchEvent(evt);
        }
    }
}

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
