import {Component, OnDestroy, OnInit} from '@angular/core';
import {Observable, of, Subject} from 'rxjs';
import {select, Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import {catchError, takeUntil} from 'rxjs/operators';
import {UpdateLoggingPage} from '@ofActions/logging.actions';
import {selectLoggingCount, selectLoggingFilter} from '@ofSelectors/logging.selectors';
import {ConfigService} from '@ofServices/config.service';

@Component({
  selector: 'of-logging-page',
  templateUrl: './logging-page.component.html',
  styleUrls: ['./logging-page.component.scss']
})
export class LoggingPageComponent implements OnInit, OnDestroy {

  page = 0;
  collectionSize$: Observable<number>;
  size: number;
  unsubscribe$: Subject<void> = new Subject<void>();

  constructor(private store: Store<AppState>, private configService: ConfigService) {
  }

  ngOnInit(): void {
    this.collectionSize$ = this.store.pipe(
        select(selectLoggingCount),
        catchError(err => of(0))
    );
    this.size = this.configService.getConfigValue('archive.filters.page.size', 10);

    this.store.select(selectLoggingFilter)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(filters => {
          const pageFilter = filters.get('page');
          // page on ngb-pagination component start at 1 , and page on backend start at 0
          if (pageFilter) {
            this.page = +pageFilter[0] + 1;
          }
        });

  }

  updateResultPage(currentPage): void {

    // page on ngb-pagination component start at 1 , and page on backend start at 0
    this.store.dispatch(new UpdateLoggingPage({page: currentPage - 1}));
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
