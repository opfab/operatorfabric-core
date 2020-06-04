

import {Component, OnInit} from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState } from '@ofStore/index';
import { buildConfigSelector } from '@ofStore/selectors/config.selectors';

@Component({
  selector: 'of-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.scss']
})
export class FiltersComponent implements OnInit {

  hideTags$: Observable<boolean>;
  hideTimerTags$: Observable<boolean>;

  constructor(private store: Store<AppState>) { }

  ngOnInit() {
    this.hideTags$ = this.store.select(buildConfigSelector('settings.tags.hide'));
    this.hideTimerTags$ = this.store.select(buildConfigSelector('feed.card.hideTimeFilter'));
  }
}
