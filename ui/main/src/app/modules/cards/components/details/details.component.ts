/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



import {AfterViewInit, Component, ContentChildren, Input, OnChanges, QueryList, SimpleChanges} from '@angular/core';
import {DetailComponent} from "../detail/detail.component";
import {Card} from "@ofModel/card.model";
import { ResizableComponent } from 'app/modules/utilities/components/resizable/resizable.component';

@Component({
    selector: 'of-details',
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.scss']
})
export class DetailsComponent extends ResizableComponent implements AfterViewInit, OnChanges {

    @ContentChildren(DetailComponent) details: QueryList<DetailComponent>;
    @Input() card: Card;
    private _i18nPrefix: string;

    constructor() {
        super();
    }

    ngAfterViewInit(): void {
        this.updateAsync();
        this.details.changes.subscribe(
            () => {
                this.updateAsync();
            }
        );
    }

    private updateAsync() {
        setTimeout(() => {
            let activeDetail = this.details.filter((tab) => tab.active)
            // if there is no active tab set, activate the first
            if (activeDetail.length === 0) {
                this.selectDetail(this.details.first);
            }
        });
    }

    selectDetail(detail: DetailComponent) {
        // deactivate all tabs
        this.details.toArray().forEach(_detail => _detail.active = false);

        // activate the tab the user has clicked on.
        if (detail)
            detail.active = true;
    }

    public get i18nPrefix(){
        return this._i18nPrefix;
    }

    ngOnChanges(changes: SimpleChanges): void {
        if(changes['card'].currentValue)
            this._i18nPrefix = changes['card'].currentValue.process+'.'+changes['card'].currentValue.processVersion+'.';
    }
}
