
import {Component, OnInit} from '@angular/core';
import {Observable, of} from 'rxjs';
import {LightCard} from '@ofModel/light-card.model';
import {select, Store} from '@ngrx/store';
import {catchError, map, tap} from 'rxjs/operators';
import {AppState} from '@ofStore/index';
import {selectArchiveLightCards, selectArchiveLightCardSelection} from '@ofSelectors/archive.selectors';

@Component({
  selector: 'of-archives',
  templateUrl: './archives.component.html',
  styleUrls: ['./archives.component.scss']
})
export class ArchivesComponent implements OnInit {

  lightCards$: Observable<LightCard[]>;
  selection$: Observable<string>;

  constructor(private store: Store<AppState>) { }

  ngOnInit() {
    this.lightCards$ = this.store.pipe(
        select(selectArchiveLightCards),
        catchError(err => of([]))
    );
    this.selection$ = this.store.select(selectArchiveLightCardSelection);
  }

}
