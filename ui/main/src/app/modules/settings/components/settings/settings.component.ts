/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import {buildConfigSelector} from '@ofSelectors/config.selectors';

@Component({
  selector: 'of-settings',
  templateUrl: './settings.component.html'
})
export class SettingsComponent implements OnInit {
  locales$: Observable<string[]>;
  timeZones$: Observable<string[]>;
  hideTags$: Observable<boolean>;
  disableInfos$: Observable<boolean>;

  constructor(private store: Store<AppState>) { }

  ngOnInit() {
    this.locales$ = this.store.select(buildConfigSelector('i18n.supported.locales'));
    this.timeZones$ = this.store.select(buildConfigSelector('i10n.supported.time-zones'));
    this.hideTags$ = this.store.select(buildConfigSelector('settings.tags.hide'));
    this.disableInfos$ = this.store.select(buildConfigSelector('settings.infos.disable'));
  }

}
