/* Copyright (c) 2018-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {AppState} from '@ofStore/index';
import {Store} from '@ngrx/store';
import {debounceTime, distinctUntilChanged, takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FullCalendarComponent} from '@fullcalendar/angular';
import {EventInput} from '@fullcalendar/core';
import allLocales from '@fullcalendar/core/locales-all';
import {ClearLightCardSelectionAction, SelectLightCardAction} from '@ofActions/light-card.actions';
import {LoadCardAction} from '@ofActions/card.actions';
import {NgbModal, NgbModalOptions, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {FilterType} from '@ofModel/feed-filter.model';
import {HourAndMinutes, TimeSpan} from '@ofModel/card.model';
import {ProcessesService} from '@ofServices/processes.service';
import {LightCardsStoreService} from '@ofServices/lightcards/lightcards-store.service';
import {FilterService} from '@ofServices/lightcards/filter.service';
import {ConfigService} from 'app/business/config/config.service';
import {Frequency} from 'rrule';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import bootstrapPlugin from '@fullcalendar/bootstrap';
import rrulePlugin from '@fullcalendar/rrule';

@Component({
    selector: 'of-calendar',
    templateUrl: './calendar.component.html',
    styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit, OnDestroy, AfterViewInit {
    constructor(
        private store: Store<AppState>,
        private modalService: NgbModal,
        private processesService: ProcessesService,
        private lightCardsStoreService: LightCardsStoreService,
        private filterService: FilterService,
        private configService: ConfigService
    ) {
        processesService.getAllProcesses().forEach((process) => {
            if (!!process.uiVisibility && !!process.uiVisibility.calendar) this.mapOfProcesses.set(process.id, 1);
        });
    }

    @ViewChild('calendar') calendarComponent: FullCalendarComponent; // the #calendar in the template
    @ViewChild('cardDetail') cardDetailTemplate: ElementRef; // the #cardDetail in the template


    private unsubscribe$ = new Subject<void>();
    calendarVisible = true;
    locales = allLocales;
    calendarEvents: EventInput[] = [];
    modalRef: NgbModalRef;

    // allDaySlot is now specific to timeGrid views (since v4), so it generates an error in build if we specify that the type of calendarOptions is
    // CalendarOptions... Yet it seems to be the correct way to set this property since it works as intended.
    calendarOptions = {
        plugins: [
            dayGridPlugin,
            timeGridPlugin,
            bootstrapPlugin,
            interactionPlugin,
            rrulePlugin],
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,today,next',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        weekends: true,
        scrollTime: "'00:00'",
        contentHeight: 750,
        slotDuration: '01:00:00',
        allDaySlot: false,
        selectable: false,
        navLinks: false,
        dayHeaderFormat: {weekday: 'long'},
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
        return (
            CalendarComponent.formatTwoDigits(hourAndMinutes.hours + Math.floor(duration / 60)) +
            ':' +
            CalendarComponent.formatTwoDigits(hourAndMinutes.minutes + (duration % 60))
        );
    }

    ngOnInit() {
        this.initDataPipe();
    }

    ngAfterViewInit() {
        this.setLocale();
    }

    private setLocale() {
        this.configService.getConfigValueAsObservable('settings.locale')
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((locale) => this.calendarComponent.getApi().setOption('locale', locale));
    }

    private initDataPipe(): void {
        this.lightCardsStoreService
            .getLightCards()
            .pipe(takeUntil(this.unsubscribe$), debounceTime(200), distinctUntilChanged())
            .subscribe((cards) => this.processCards(cards));
    }

    private processCards(cards) {
        this.calendarEvents = [];
        for (const card of cards) {
            if (!!this.mapOfProcesses && this.mapOfProcesses.has(card.process)) {
                if (card.timeSpans) {
                    for (const timespan of card.timeSpans) {
                        if (timespan.end) {
                            const startDate = new Date(timespan.start.valueOf());
                            const endDate = new Date(timespan.end.valueOf());

                            if (timespan.recurrence) {

                                this.calendarEvents = this.calendarEvents.concat({
                                    // add new event data. must create new array
                                    id: card.id,
                                    title: card.titleTranslated,
                                    allDay: false,
                                    className: [
                                        'opfab-calendar-event',
                                        'opfab-calendar-event-' + card.severity.toLowerCase()
                                    ],
                                    rrule: {
                                        freq: Frequency.WEEKLY,
                                        byweekday: this.getDaysOfWeek(timespan),
                                        bymonth: this.getMonths(timespan),
                                        dtstart: startDate,
                                        until: endDate,
                                        byhour: timespan.recurrence.hoursAndMinutes.hours,
                                        byminute: timespan.recurrence.hoursAndMinutes.minutes
                                    }
                                });
                            } else {
                                this.calendarEvents = this.calendarEvents.concat({
                                    // add new event data. must create new array
                                    id: card.id,
                                    title: card.titleTranslated,
                                    start: startDate,
                                    end: endDate,
                                    className: [
                                        'opfab-calendar-event',
                                        'opfab-calendar-event-' + card.severity.toLowerCase()
                                    ],
                                    allDay: false
                                });
                            }
                        }
                    }
                }
            }
        }
        // It is necessary to reassign the updated events to the corresponding options property to trigger change detection
        // See https://fullcalendar.io/docs/angular §Modifying properties
        this.calendarOptions.events = this.calendarEvents;
    }

    private getDaysOfWeek(timeSpan: TimeSpan):Array<number>
    {
        let daysOfWeek = [];
        if (timeSpan.recurrence) {
            if (timeSpan.recurrence.daysOfWeek) {
                daysOfWeek = timeSpan.recurrence.daysOfWeek.map((d) => d - 1);
            } else {
                daysOfWeek = [0,1,2,3,4,5,6];
            }
        }
        return daysOfWeek;
    }

    private getMonths(timeSpan: TimeSpan):Array<number>
    {
        let months = [];
        if (timeSpan.recurrence) {
            if (timeSpan.recurrence.months) {
                months = timeSpan.recurrence.months.map((d) => d + 1);
            } else {
                months = [1,2,3,4,5,6,7,8,9,10,11,12];
            }
        }
        return months;
    }

    selectCard(info) {
        this.store.dispatch(new SelectLightCardAction({selectedCardId: info.event.id}));
        this.store.dispatch(new LoadCardAction({id: info.event.id}));
        const options: NgbModalOptions = {
            size: 'fullscreen'
        };
        this.modalRef = this.modalService.open(this.cardDetailTemplate, options);

        // Clear card selection when modal is dismissed by pressing escape key or clicking outside of modal
        // Closing event is already handled in card detail component
        this.modalRef.dismissed.subscribe(() => {
            this.store.dispatch(new ClearLightCardSelectionAction());
        });
    }

    datesRangeChange(dateInfo) {
        this.filterService.updateFilter(FilterType.BUSINESSDATE_FILTER, true, {
            start: dateInfo.view.activeStart.getTime(),
            end: dateInfo.view.activeEnd.getTime()
        });
    }

    ngOnDestroy() {
        if (!!this.modalRef) {
            this.modalRef.close();
        }
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
