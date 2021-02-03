/* Copyright (c) 2020, RTEi (http://www.rte-international.com)
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Store} from '@ngrx/store';
import {TranslateService} from '@ngx-translate/core';
import {AppState} from '@ofStore/index';
import {buildSettingsOrConfigSelector} from '@ofStore/selectors/settings.x.config.selectors';
import {Observable, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
  selector: 'of-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit, OnDestroy {

  unsubscribe$: Subject<void> = new Subject<void>();

  activeTab: string;
  usersLabel: string;
  entitiesLabel: string;
  groupsLabel: string;

  public paginationDefaultPageSize = 10;
  public paginationPageSizeOptions = [5, 10, 25, 50, 100];
  public paginationPageSize = this.paginationDefaultPageSize;

  //TODO Why do we need to use translate.get and subscriptions rather than the translate directive like everywhere else?
  constructor(private route: ActivatedRoute, protected store: Store<AppState>, protected translate: TranslateService) {
    this.getLocale().pipe(takeUntil(this.unsubscribe$)).subscribe(locale => {
      this.translate.use(locale);
      this.translate.get(['admin.tabs.users', 'admin.tabs.entities', 'admin.tabs.groups'])
        .subscribe(translations => {
          this.usersLabel = translations['admin.tabs.users'];
          this.entitiesLabel = translations['admin.tabs.entities'];
          this.groupsLabel = translations['admin.tabs.groups'];
        });
    });
  }

  ngOnInit() {
    const url = this.route.snapshot.url.join('').trim();
    this.activeTab = (url.length !== 0) ? url : 'users';
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  private getLocale(): Observable<string> {
    return this.store.select(buildSettingsOrConfigSelector('locale'));
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  onPageSizeChanged() {
    // Cast to get rid of "Property 'value' does not exist on type 'HTMLElement'."
    const value = (<HTMLInputElement> document.getElementById('page-size-select')).value;
    this.paginationPageSize = Number(value);
  }

}
