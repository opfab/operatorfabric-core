

import {Component, OnInit} from '@angular/core';
import {Observable, of, Subscription} from 'rxjs';
import {LightCard} from '@ofModel/light-card.model';
import {select, Store} from '@ngrx/store';
import {catchError, map, tap} from 'rxjs/operators';
import {AppState} from '@ofStore/index';
import {selectArchiveLightCards, selectArchiveLightCardSelection,selectArchiveLoading} from '@ofSelectors/archive.selectors';
import { FlushArchivesResult } from '@ofStore/actions/archive.actions';

@Component({
  selector: 'of-archives',
  templateUrl: './archives.component.html',
  styleUrls: ['./archives.component.scss']
})
export class ArchivesComponent implements OnInit {

  lightCards$: Observable<LightCard[]>;
  selection$: Observable<string>;
  isEmpty$ : Observable<boolean>;
  loading$ : Observable<boolean>;
  subscription1$: Subscription;
  subscription2$: Subscription;
  isEmptyMessage : boolean;
  loadingIsTrue: boolean;

  constructor(private store: Store<AppState>) {
    this.store.dispatch(new FlushArchivesResult());
  }

   ngOnInit() {
        this.isEmptyMessage = false;
        this.lightCards$ = this.store.pipe(
            select(selectArchiveLightCards),
            catchError(err => of([]))
         );

        this.selection$ = this.store.select(selectArchiveLightCardSelection);
        this.loading$ = this.store.pipe(select(selectArchiveLoading));

        this.subscription1$ = this.loading$.subscribe((result) => {
            this.loadingIsTrue = result === true;
        });

        this.isEmpty$ = this.lightCards$.pipe(
            map((result) => result.length === 0)
        );

        this.subscription2$  = this.isEmpty$.subscribe((result) => {
            this.isEmptyMessage = result === true;
        })

    }

      ngOnDestroy() {
        // All the children of subscription will be unsubscribed.
        this.subscription1$.unsubscribe();
        this.subscription2$.unsubscribe();
      }
}
