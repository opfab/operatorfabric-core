/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { LightCard } from '@ofModel/light-card.model';
import { Router } from '@angular/router';
import { selectCurrentUrl } from '@ofStore/selectors/router.selectors';
import { Store } from '@ngrx/store';
import { AppState } from '@ofStore/index';
import { takeUntil } from 'rxjs/operators';
import { TimeService } from '@ofServices/time.service';
import { Subject } from 'rxjs';
import { ConfigService } from '@ofServices/config.service';
import { AppService, PageType } from '@ofServices/app.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'of-light-card',
    templateUrl: './light-card.component.html',
    styleUrls: ['./light-card.component.scss']
})
export class LightCardComponent implements OnInit, OnDestroy {

    @Input() public open = false;
    @Input() public lightCard: LightCard;
    @Input() public displayUnreadIcon = true;
    currentPath: any;
    protected _i18nPrefix: string;
    cardTitle: string;
    dateToDisplay: string;

    private ngUnsubscribe: Subject<void> = new Subject<void>();

    /* istanbul ignore next */
    constructor(
        private router: Router,
        private store: Store<AppState>,
        private time: TimeService,
        private configService: ConfigService,
        private _appService: AppService,
        protected translate: TranslateService
    ) {
     }

    ngOnInit() {
        this._i18nPrefix = `${this.lightCard.process}.${this.lightCard.processVersion}.`;
        this.store
            .select(selectCurrentUrl)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((url) => {
                if (url) {
                    const urlParts = url.split('/');
                    this.currentPath = urlParts[1];
                }
            });
        this.computeDisplayedDate();
    }

    computeDisplayedDate() {
        switch (this.configService.getConfigValue('feed.card.time.display', 'BUSINESS')) {
            case 'NONE':
                this.dateToDisplay = '';
                break;
            case 'LTTD':
                this.dateToDisplay = this.handleDate(this.lightCard.lttd);
                break;
            case 'PUBLICATION':
                this.dateToDisplay = this.handleDate(this.lightCard.publishDate);
                break;
            case 'BUSINESS_START':
                this.dateToDisplay = this.handleDate(this.lightCard.startDate);
                break;
            default:
                this.dateToDisplay = `${this.handleDate(this.lightCard.startDate)} - ${this.handleDate(this.lightCard.endDate)}`;
        }
    }

    handleDate(timeStamp: number): string {
        return this.time.formatDateTime(timeStamp);
    }

    public select() {
        this.router.navigate(['/' + this.currentPath, 'cards', this.lightCard.id]);
    }

    get i18nPrefix(): string {
        return this._i18nPrefix;
    }

    isArchivePageType(): boolean {
        return this._appService.pageType == PageType.ARCHIVE;
    }

    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }
}
