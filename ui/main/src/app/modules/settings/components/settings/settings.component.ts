
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
