/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Component, Input, OnInit} from '@angular/core';
import {LightCard} from '@ofModel/light-card.model';
import {Router} from '@angular/router';
import {selectCurrentUrl} from '@ofStore/selectors/router.selectors';
import {Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import {selectCardStateSelectedId} from "@ofSelectors/card.selectors";
import {map} from "rxjs/operators";

@Component({
    selector: 'of-card',
    templateUrl: './card.component.html',
    styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit{

    @Input() public open: boolean = false;
    @Input() public lightCard: LightCard;
    currentPath: any;
    private _i18nPrefix: string;

    /* istanbul ignore next */
    constructor(private router: Router,
                private store: Store<AppState>) {

    }

    public select() {
        this.router.navigate(['/'+this.currentPath,'cards',this.lightCard.id]);
        this.open=true;
    }

    ngOnInit() {
        this._i18nPrefix = this.lightCard.publisher+'.'+this.lightCard.publisherVersion+'.'
        this.store.select(selectCurrentUrl).subscribe(url=>{
            if(url)
                this.currentPath = url.split('/')[1];
        });
        this.store.select(selectCardStateSelectedId)
            .pipe(
                map(id=>this.lightCard.id == id)
            ).subscribe(open=>this.open = open)
        ;
    }

    get i18nPrefix(): string {
        return this._i18nPrefix;
    }

}
