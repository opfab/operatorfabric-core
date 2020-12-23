/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import { AppState } from '@ofStore/index';
import { select, Store } from '@ngrx/store';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import * as feedSelectors from '@ofSelectors/feed.selectors';
import { Component, ViewChild, OnDestroy, OnInit, AfterViewInit, ElementRef, HostListener } from '@angular/core';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGrigPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import allLocales from '@fullcalendar/core/locales-all';
import bootstrapPlugin from '@fullcalendar/bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { SelectLightCard } from '@ofActions/light-card.actions';
import { LoadCard } from '@ofActions/card.actions';
import { buildSettingsOrConfigSelector } from '@ofStore/selectors/settings.x.config.selectors';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ApplyFilter } from '@ofStore/actions/feed.actions';
import { FilterType } from '@ofServices/filter.service';
import moment from 'moment';
import { HourAndMinutes } from '@ofModel/card.model';

@Component({
  selector: 'of-calendar',
  templateUrl: './calendar.component.html'
})
export class CalendarComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('calendar', null) calendarComponent: FullCalendarComponent; // the #calendar in the template
  @ViewChild('cardDetail', null) cardDetailTemplate: ElementRef; // the #calendar in the template

  private unsubscribe$ = new Subject<void>();
  calendarVisible = true;
  calendarPlugins = [dayGridPlugin, timeGrigPlugin, interactionPlugin, bootstrapPlugin];
  locales = allLocales;
  themeSystem = 'bootstrap';
  calendarEvents: EventInput[] = [];
  modalRef: NgbModalRef;


  constructor(private store: Store<AppState>,
              private translate: TranslateService,
              private modalService: NgbModal
  ) { }

  ngOnInit() {
    this.initDataPipe();
  }

  ngAfterViewInit() {
    this.setLocale();
    this.resizeCalendar();
  }

  @HostListener('window:resize')
  resizeCalendar() {
    this.calendarComponent.getApi().setOption('height', window.innerHeight - 150);
  }

  private setLocale() {
    this.store.select(buildSettingsOrConfigSelector('locale'))
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(locale => this.calendarComponent.getApi().setOption('locale', locale));
  }

  private initDataPipe(): void {
    this.store.pipe(select((feedSelectors.selectFeed)))
      .pipe(takeUntil(this.unsubscribe$), debounceTime(200), distinctUntilChanged())
      .subscribe(cards => this.processCards(cards));
  }

  private processCards(cards) {
    this.calendarEvents = [];
    for (const card of cards) {
      let color;
      if (card.severity === 'INFORMATION') { color = 'blue'; }
      if (card.severity === 'COMPLIANT') { color = 'green'; }
      if (card.severity === 'ACTION') { color = 'orange'; }
      if (card.severity === 'ALARM') { color = 'red'; }
      this.translate.get(card.process + '.' + card.processVersion + '.' + card.title.key
          , card.title.parameters).subscribe(title => {
        if (card.timeSpans) {
          for (const timespan of card.timeSpans) {
            if (timespan.end) {
              const startDate = new Date(timespan.start.valueOf());
              const endDate = new Date(timespan.end.valueOf());

              if (timespan.recurrence) {
                this.calendarEvents = this.calendarEvents.concat({ // add new event data. must create new array
                  id: card.id,
                  title: title,
                  backgroundColor: color,
                  allDay: false,
                  startRecur: startDate,
                  endRecur: endDate,
                  daysOfWeek: timespan.recurrence ? timespan.recurrence.daysOfWeek.map(d => d % 7) : [],
                  startTime: timespan.recurrence.hoursAndMinutes ? this.formatTwoDigits(timespan.recurrence.hoursAndMinutes.hours) + ':' + this.formatTwoDigits(timespan.recurrence.hoursAndMinutes.minutes) : null,
                  endTime: timespan.recurrence.durationInMinutes ? this.getEndTime(timespan.recurrence.hoursAndMinutes, timespan.recurrence.durationInMinutes) : null
                });
              } else {
                this.calendarEvents = this.calendarEvents.concat({ // add new event data. must create new array
                  id: card.id,
                  title: title,
                  start: startDate,
                  end: endDate,
                  backgroundColor: color,
                  allDay: false
                });
              }

            }
          }
        }
      }
      );
    }
  }

  private formatTwoDigits(time: number) {
    return time < 10 ? '0' + time : time;
  }

  private getEndTime(hourAndMinutes: HourAndMinutes, duration: number) {
    duration = Math.min(duration, 30);
    return this.formatTwoDigits(hourAndMinutes.hours + Math.floor(duration / 60)) + ':' + this.formatTwoDigits(hourAndMinutes.minutes + duration % 60);
  }

  handleDateClick(arg) {

  }

  selectCard(info) {
    this.store.dispatch(new SelectLightCard({ selectedCardId: info.event.id }));
    this.store.dispatch(new LoadCard({ id: info.event.id }));
    const options: NgbModalOptions = {
      size: 'fullscreen'
  };
  this.modalRef = this.modalService.open(this.cardDetailTemplate, options);

  }

  datesRangeChange(info) {
    this.store.dispatch(new ApplyFilter({
      name: FilterType.BUSINESSDATE_FILTER, active: true,
      status: {start: info.view.activeStart.getTime(), end: info.view.activeEnd.getTime()}
      }));
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
