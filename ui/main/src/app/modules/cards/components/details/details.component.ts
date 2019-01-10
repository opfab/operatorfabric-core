/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {AfterViewInit, Component, ContentChildren, Input, QueryList} from '@angular/core';
import {DetailComponent} from "../detail/detail.component";
import {Card} from "../../../../model/card.model";

@Component({
    selector: 'of-details',
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.css']
})
export class DetailsComponent implements AfterViewInit {

    @ContentChildren(DetailComponent) details: QueryList<DetailComponent>;
    @Input() card: Card;

    constructor() {
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
        this.details.toArray().forEach(detail => detail.active = false);

        // activate the tab the user has clicked on.
        if (detail)
            detail.active = true;
    }

}
