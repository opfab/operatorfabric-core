/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {AppState} from '@ofStore/index';
import {select, Store} from '@ngrx/store';
import {debounceTime, distinctUntilChanged, takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import * as feedSelectors from '@ofSelectors/feed.selectors';
import {AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FullCalendarComponent} from '@fullcalendar/angular';
import {EventInput} from '@fullcalendar/core';
import allLocales from '@fullcalendar/core/locales-all';
import {TranslateService} from '@ngx-translate/core';
import {SelectLightCard} from '@ofActions/light-card.actions';
import {LoadCard} from '@ofActions/card.actions';
import {buildSettingsOrConfigSelector} from '@ofStore/selectors/settings.x.config.selectors';
import {NgbModal, NgbModalOptions, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {ApplyFilter} from '@ofStore/actions/feed.actions';
import {FilterType} from '@ofServices/filter.service';
import {HourAndMinutes} from '@ofModel/card.model';
import {ProcessesService} from '@ofServices/processes.service';
import {DisplayContext} from '@ofModel/templateGateway.model';

@Component({
  selector: 'of-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit, OnDestroy, AfterViewInit {

  constructor(private store: Store<AppState>,
              private translate: TranslateService,
              private modalService: NgbModal,
              private processesService: ProcessesService) {
    processesService.getAllProcesses().forEach(process => {
      if (!!process.uiVisibility && !!process.uiVisibility.calendar)
        this.mapOfProcesses.set(process.id, 1);
    });
  }

  @ViewChild('calendar') calendarComponent: FullCalendarComponent; // the #calendar in the template
  @ViewChild('cardDetail') cardDetailTemplate: ElementRef; // the #cardDetail in the template

  displayContext = DisplayContext.REALTIME;
  private unsubscribe$ = new Subject<void>();
  calendarVisible = true;
  locales = allLocales;
  calendarEvents: EventInput[] = [];
  modalRef: NgbModalRef;

  // allDaySlot is now specific to timeGrid views (since v4), so it generate an error in build if we specify that the type of calendarOptions is
  // CalendarOptions... Yet it seems to be the correct way to set this property since it works as intended.
  calendarOptions = {
    initialView: 'dayGridMonth',
    headerToolbar : {
      left: 'prev,today,next',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    weekends: true,
    scrollTime: '\'00:00\'',
    contentHeight: 750,
    slotDuration: '01:00:00',
    allDaySlot: false,
    selectable: false,
    navLinks: false,
    dayHeaderFormat: { weekday: 'long' },
    events: this.calendarEvents,
    locales: this.locales,
    themeSystem: 'standard',
    datesSet: this.datesRangeChange.bind(this),
    eventClick: this.selectCard.bind(this)
  };
  mapOfProcesses = new Map<string, number>();

  private static formatTwoDigits(time: number) {
    return time < 10 ? '0' + time : time;
  }

  private static getEndTime(hourAndMinutes: HourAndMinutes, duration: number) {
    duration = Math.min(duration, 30);
    return CalendarComponent.formatTwoDigits(hourAndMinutes.hours + Math.floor(duration / 60)) + ':' + CalendarComponent.formatTwoDigits(hourAndMinutes.minutes + duration % 60);
  }

  ngOnInit() {
    this.initDataPipe();
  }

  ngAfterViewInit() {
    this.setLocale();

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
      if (!!this.mapOfProcesses && this.mapOfProcesses.has(card.process)) {
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
                        allDay: false,
                        startRecur: startDate,
                        endRecur: endDate,
                        className: ['opfab-calendar-event', 'opfab-calendar-event-' + card.severity.toLowerCase()],
                        daysOfWeek: timespan.recurrence ? timespan.recurrence.daysOfWeek.map(d => d % 7) : [],
                        startTime: timespan.recurrence.hoursAndMinutes ? CalendarComponent.formatTwoDigits(timespan.recurrence.hoursAndMinutes.hours) + ':' + CalendarComponent.formatTwoDigits(timespan.recurrence.hoursAndMinutes.minutes) : null,
                        endTime: timespan.recurrence.durationInMinutes ? CalendarComponent.getEndTime(timespan.recurrence.hoursAndMinutes, timespan.recurrence.durationInMinutes) : null
                      });
                    } else {
                      this.calendarEvents = this.calendarEvents.concat({ // add new event data. must create new array
                        id: card.id,
                        title: title,
                        start: startDate,
                        end: endDate,
                        className: ['opfab-calendar-event', 'opfab-calendar-event-' + card.severity.toLowerCase()],
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
    // It is necessary to reassign the updated events to the corresponding options property to trigger change detection
    // See https://fullcalendar.io/docs/angular §Modifying properties
    this.calendarOptions.events = this.calendarEvents;
  }

  selectCard(info) {
    this.store.dispatch(new SelectLightCard({ selectedCardId: info.event.id }));
    this.store.dispatch(new LoadCard({ id: info.event.id }));
    const options: NgbModalOptions = {
      size: 'fullscreen'
  };
  this.modalRef = this.modalService.open(this.cardDetailTemplate, options);

  }

  datesRangeChange(dateInfo) {
    this.store.dispatch(new ApplyFilter({
      name: FilterType.BUSINESSDATE_FILTER, active: true,
      status: {start: dateInfo.view.activeStart.getTime(), end: dateInfo.view.activeEnd.getTime()}
      }));
  }

  ngOnDestroy() {
    if (!!this.modalRef) {
      this.modalRef.close();
    }
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
