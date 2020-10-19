/* Copyright (c) 2018-2020, RTEI (http://www.rte-international.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { AppState } from '@ofStore/index';
import { buildSettingsOrConfigSelector } from '@ofStore/selectors/settings.x.config.selectors';
import { Observable } from 'rxjs';

@Component({
  selector: 'of-admin',
  templateUrl: './admin.component.html'
})
export class AdminComponent implements OnInit {

  activeTab: string;
  usersLabel: string;
  entitiesLabel: string;
  groupsLabel: string;

  constructor(private route: ActivatedRoute, protected store: Store<AppState>, protected translate: TranslateService) {
    this.getLocale().subscribe(locale => {
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

}
