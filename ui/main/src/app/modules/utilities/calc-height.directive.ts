import {
    Directive, ElementRef, AfterViewChecked,
    Input, HostListener, AfterViewInit, OnChanges, SimpleChanges
} from '@angular/core';
import {debounceTime, distinctUntilChanged, tap, throttleTime} from "rxjs/operators";
import {Observable, Subject} from "rxjs";
import {now} from "moment";

@Directive({
    selector: '[calcHeightDirective]'
})
export class CalcHeightDirective {

    //TODO Fix padding error

    @Input()
    fixedHeightClass: any;

    @Input()
    calcHeightClass: any;

    private _resizeSubject$: Subject<number>;

    constructor(private el: ElementRef) {
           this._resizeSubject$ = new Subject<number>();
           this._resizeSubject$.asObservable().pipe(
               debounceTime(500),
               //TODO distinctUntilChanged
           ).subscribe(x => this.calcHeight(this.el.nativeElement, this.fixedHeightClass, this.calcHeightClass));
    }

    @HostListener('window:resize', ['$event.target.innerHeight'])
    onResize(height: number) {

        this._resizeSubject$.next(height);

    }

    calcHeight(parent: HTMLElement, fixedHeightClass: string, calcHeightClass: string) {

        if (!parent) return;

        //Get elements that should be allowed to define their own height (based on content), which are then "fixed" for this calculation
        const fixedElements = parent.getElementsByClassName(fixedHeightClass);

        //Get elements that for which the height should be calculated
        //TODO Decide what to do if several elements (same or divide)
        const calcElements = parent.getElementsByClassName(calcHeightClass);

        if (!calcElements) return;

        //Sum heights of fixed elements
        const sumFixElemHeights = Array.from(fixedElements)
            .map(x => x.getBoundingClientRect().height).reduce((prev, curr) => {
                return prev + curr;
            }, 0);

        // Calculate available height by subtracting the heights of fixed elements from the total window height

        //const availableHeight = window.innerHeight - sumFixElemHeights;
        //const availableHeight = parent.getElementsByTagName("body").item(0).getBoundingClientRect().height - sumFixElemHeights;
        //const availableHeight = document.getElementsByTagName("body").item(0).getBoundingClientRect().height - sumFixElemHeights;
        //const availableHeight = parent.getBoundingClientRect().height - sumFixElemHeights;
        //TODO Find a better way to define total height depending on the calling element
        let availableHeight = 0;
        if(calcHeightClass == "calc-height-main-layout") {
            availableHeight = document.getElementsByTagName("body").item(0).getBoundingClientRect().height - sumFixElemHeights;
        } else if (calcHeightClass == "calc-height-feed-content") {
            availableHeight = parent.getBoundingClientRect().height - sumFixElemHeights;
        } else {
            console.log("CalcHeightDirective - unexpected behaviour");
        }

        // Apply height and overflow
        Array.from(calcElements)
            .forEach((x: HTMLElement) =>
            {
                x.style.height = `${availableHeight}px`;
                x.style.overflowY = 'scroll'
                x.style.overflowX = 'hidden';

            });

    }
}
