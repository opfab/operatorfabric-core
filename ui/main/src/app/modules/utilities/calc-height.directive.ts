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

    //TODO Get rid of cascading "style="height: 100%;"

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
            .map(x => x.getBoundingClientRect().height).reduce((prev, curr) => { //TODO Find out if should be replaced by clientHeight or offsetHeight
                return prev + curr;
            }, 0);

        // Calculate available height by subtracting the heights of fixed elements from the total window height
        let availableHeight = parent.clientHeight - sumFixElemHeights;

        // Apply height and overflow
        Array.from(calcElements)
            .forEach((x: HTMLElement) => x.style.height = `${availableHeight}px`
            );
    }
}
