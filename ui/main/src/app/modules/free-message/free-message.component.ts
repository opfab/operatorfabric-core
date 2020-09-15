/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import { Component, OnDestroy, TemplateRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AppState } from '@ofStore/index';
import { CardService } from '@ofServices/card.service';
import { UserService } from '@ofServices/user.service';
import { selectIdentifier } from '@ofSelectors/authentication.selectors';
import { map, switchMap, takeUntil, withLatestFrom } from 'rxjs/operators';
import { Card, fromCardToLightCard } from '@ofModel/card.model';
import { I18n } from '@ofModel/i18n.model';
import { Observable, Subject } from 'rxjs';
import { selectProcesses } from '@ofSelectors/process.selector';
import { Process, State } from '@ofModel/processes.model';
import { transformToTimestamp } from '../archives/components/archive-filters/archive-filters.component';
import { TimeService } from '@ofServices/time.service';
import { selectAllEntities } from '@ofSelectors/user.selector';
import { Entity, User } from '@ofModel/user.model';
import { Severity } from '@ofModel/light-card.model';
import { Guid } from 'guid-typescript';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap/modal/modal-ref';

@Component({
    selector: 'of-free-message',
    templateUrl: './free-message.component.html',
    styleUrls: ['./free-message.component.scss']
})
export class FreeMessageComponent implements OnDestroy {

    messageForm: FormGroup;
    message: string;
    error: any;

    fetchedProcesses: Process[];
    currentUser: User;

    severityOptions = Object.keys(Severity).map(severity => {
        return {
            value: severity,
            label: new I18n('free-message.options.severity.' + severity)
        };
    });
    processOptions$: Observable<any>;
    stateOptions$: Observable<any>;
    entityOptions$: Observable<any>;

    card: Card;

    unsubscribe$: Subject<void> = new Subject<void>();
    readonly msg = 'Card will be resumed here soon!';

    public displaySendResult = false;

    modalRef: NgbModalRef;

    displayForm() {
        return !this.displaySendResult;
    }

    constructor(private store: Store<AppState>,
        private formBuilder: FormBuilder,
        private cardService: CardService,
        private userService: UserService,
        private timeService: TimeService,
        private modalService: NgbModal
    ) {

        this.messageForm = new FormGroup({
            severity: new FormControl(''),
            process: new FormControl(''),
            state: new FormControl(''),
            startDate: new FormControl(''),
            endDate: new FormControl(''),
            comment: new FormControl(''),
            entities: new FormControl('')
        }
        );

        this.processOptions$ = this.store.select(selectProcesses).pipe(
            takeUntil(this.unsubscribe$),
            map((allProcesses: Process[]) => {
                return allProcesses.map((proc: Process) => {
                    const _i18nPrefix = proc.id + '.' + proc.version + '.';
                    const label = proc.name ? (_i18nPrefix + proc.name) : proc.id;
                    return {
                        value: proc.id,
                        label: label
                    };
                });
            })
        );

        this.stateOptions$ = this.messageForm.get('process').valueChanges.pipe(
            withLatestFrom(this.store.select(selectProcesses)),
            map(([selectedProcessId, allProcesses]: [string, Process[]]) => {
                // TODO What if selectedProcessId is null ? == vs ===
                const selectedProcess = allProcesses.find(process => process.id === selectedProcessId);
                if (selectedProcess) {
                    return Object.entries(selectedProcess.states).map(([id, state]: [string, State]) => {
                        const label = state.name ? (new I18n(this.getI18nPrefixFromProcess(selectedProcess)
                            + state.name)) : id;
                        return {
                            value: id,
                            label: label
                        };
                    });
                } else {
                    return [];
                }
            })
        );

        this.entityOptions$ = this.store.select(selectAllEntities).pipe(
            takeUntil(this.unsubscribe$),
            map((allEntities: Entity[]) => allEntities.map((entity: Entity) => {
                return { value: entity.id, label: entity.name };
            })
            )
        );

        this.store.select(selectProcesses)
            .pipe(takeUntil(this.unsubscribe$)).
            subscribe((allProcesses: Process[]) => {
                this.fetchedProcesses = allProcesses;
            });

        const userWithPerimeters = this.userService.getCurrentUserWithPerimeters();
        if (userWithPerimeters) {
            this.currentUser = userWithPerimeters.userData;
        }
    }

    onSubmitForm(template: TemplateRef<any>) {
        const formValue = this.messageForm.value;

        const processFormVal = formValue['process'];
        const selectedProcess = this.fetchedProcesses.find(process => {
            return process.id === processFormVal;
        });
        const processVersion = selectedProcess.version;
        const formValueElement = formValue['state'];
        const selectedState = selectedProcess.states[formValueElement];
        const titleKey = (new I18n((selectedState.name) ? selectedProcess.name : formValueElement));
        const now = new Date().getTime();

        const generatedId = Guid.create().toString();

        let tempCard = {
            uid: generatedId,
            id: generatedId,
            publishDate: null,
            publisher: this.currentUser.entities[0],
            processVersion: processVersion,
            process: processFormVal,
            processInstanceId: generatedId,
            state: formValueElement,
            startDate: formValue['startDate'] ? this.createTimestampFromValue(formValue['startDate']) : now,
            severity: formValue['severity'],
            hasBeenAcknowledged: false,
            hasBeenRead: false,
            entityRecipients: [formValue['entities']],
            externalRecipients: null,
            title: titleKey,
            summary: new I18n('SUMMARY CONTENT TO BE DEFINED'), // TODO
            data: {
                comment: formValue['comment']
            },
            recipient: null
        } as Card;

        const endDate = formValue['endDate'];
        if (!!endDate) {
            tempCard = {
                ...tempCard,
                endDate: this.createTimestampFromValue(endDate)
            };
        }

        this.card = tempCard;
        this.modalRef = this.modalService.open(template);
    }

    createTimestampFromValue = (value: any): number => {
        const { date, time } = value;
        if (date) {
            return this.timeService.toNgBNumberTimestamp(transformToTimestamp(date, time));
            // TODO Why do we need 2 transformations? What is an NgBTimestamp vs a plain Timestamp?
        } else {
            return null;
        }
    }

    getI18nPrefixFromProcess = (process: Process): string => {
        return process.id + '.' + process.version + '.';
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    confirm(): void {
        this.cardService.postResponseCard(this.card)
            .subscribe(
                resp => {
                    this.message = '';
                    const msg = resp.message;
                    // TODO better way to handle perimeter errors
                    if (!!msg && msg.includes('unable')) {
                        this.error = msg;
                    } else {
                        this.message = msg;
                    }
                    this.modalRef.close(this.message);
                    this.displaySendResult = true;
                    this.messageForm.reset();
                },
                err => {
                    console.error(err);
                    this.error = err;
                    this.modalRef.close(this.error);
                    this.displaySendResult = true;
                    this.messageForm.reset();
                }
            );
    }

    decline(): void {
        this.message = 'Declined!';
        this.modalRef.dismiss(this.message);
    }

    formatTime(time) {
        return this.timeService.formatDateTime(time);
    }

    reset() {
        this.messageForm.reset();
    }

    sendAnotherFreeMessage() {
        this.card = null;
        this.displaySendResult = false;
        this.reset();
    }

    existsError(): boolean {
        return !!this.error;
    }

    noError(): boolean {
        return !this.existsError();
    }

    getLightCard() {
        return fromCardToLightCard(this.card);
    }
}
