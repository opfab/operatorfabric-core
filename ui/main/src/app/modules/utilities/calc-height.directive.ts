import {
    Directive, ElementRef,
    Input, HostListener, OnInit
} from '@angular/core';
import {debounceTime} from "rxjs/operators";
import {Subject} from "rxjs";

@Directive({
    selector: '[calcHeightDirective]'
})
export class CalcHeightDirective implements OnInit {

    @Input()
    parentId: any;

    @Input()
    fixedHeightClass: any;

    @Input()
    calcHeightClass: any;

    private _resizeSubject$: Subject<number>;

    constructor(private el: ElementRef) {

        this._resizeSubject$ = new Subject<number>();
        this._resizeSubject$.asObservable().pipe(
            debounceTime(500),
        ).subscribe(x => this.calcHeight(this.parentId, this.fixedHeightClass, this.calcHeightClass));

    }

    ngOnInit(): void {
        this._resizeSubject$.next(); //TODO This should bypass the debounce
    }

    @HostListener('window:resize', ['$event.target.innerHeight']) //TODO Remove height?
    onResize() {
        this._resizeSubject$.next();
    }

    private calcHeight(parentId: string, fixedHeightClass: string, calcHeightClass: string) {

        let parent : HTMLElement;

        parent = document.getElementById(this.parentId);

        //If no parentId was provided or search didn't yield any element, fallback is element calling the directive
        if(!parent){
            parent = this.el.nativeElement;
        }

        if(!parent){
            return;
        }

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

        //console.log("CalcHeightDirective "+fixedHeightClass+" "+parent.clientHeight+" "+sumFixElemHeights+" "+availableHeight);

        // Apply height and overflow
        Array.from(calcElements)
            .forEach((x: HTMLElement) => x.style.height = `${availableHeight}px`
            );
    }
}
