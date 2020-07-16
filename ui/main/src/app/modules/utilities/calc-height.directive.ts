/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



import {
    Directive, ElementRef,
    Input, HostListener, OnDestroy
} from '@angular/core';
import {debounceTime, takeUntil} from "rxjs/operators";
import {Subject} from "rxjs";

@Directive({
    selector: '[calcHeightDirective]'
})
export class CalcHeightDirective implements OnDestroy {

    @Input()
    parentId: any;

    @Input()
    fixedHeightClass: any;

    @Input()
    calcHeightClass: any;

    private _resizeSubject$: Subject<number>;
    private ngUnsubscribe$ = new Subject<void>();

    constructor(private el: ElementRef) {

        this._resizeSubject$ = new Subject<number>();
        this._resizeSubject$.asObservable().pipe(
            takeUntil(this.ngUnsubscribe$),
            debounceTime(300),
        ).subscribe(x => this.calcHeight(this.parentId, this.fixedHeightClass, this.calcHeightClass));

    }
    ngOnDestroy(): void {
        this.ngUnsubscribe$.next();
        this.ngUnsubscribe$.complete();
    }

    @HostListener('window:resize')
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
        //For now all elements bearing the calcHeightClass will have their height updated to the same calculated value
        //Which makes sense if they're next to one another, but another option would be to divide the available height equally
        const calcElements = parent.getElementsByClassName(calcHeightClass);

        if (!calcElements) return;

        //Sum heights of fixed elements
        const sumFixElemHeights = Array.from(fixedElements)
            .map(x => x.getBoundingClientRect().height).reduce((prev, curr) => {
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
