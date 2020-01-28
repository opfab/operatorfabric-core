
import {Component, OnInit} from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState } from '@ofStore/index';
import { buildConfigSelector } from '@ofStore/selectors/config.selectors';

@Component({
  selector: 'of-filters',
  templateUrl: './filters.component.html',
})
export class FiltersComponent implements OnInit {

  hideTags$: Observable<boolean>;

  constructor(private store: Store<AppState>) { }

  ngOnInit() {
    this.hideTags$ = this.store.select(buildConfigSelector('settings.tags.hide'));
  }

}
