/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { TranslateService } from '@ngx-translate/core';
import { Observable, of} from 'rxjs';
import { LightCardActionTypes, LoadLightCardsSuccess } from '@ofActions/light-card.actions';
import { map } from 'rxjs/operators';
import { TranslateActions, TranslationUpdateDone, TranslateActionsTypes } from '@ofActions/translate.actions';
import { LightCard } from '@ofModel/light-card.model';
import { ProcessesService } from '@ofServices/processes.service';
import { Process } from '@ofModel/processes.model';
import { Store, select } from '@ngrx/store';
import { AppState } from '@ofStore/index';
import { selectArchiveLightCards } from '@ofStore/selectors/archive.selectors';
import { selectLinesOfLoggingResult } from '@ofStore/selectors/logging.selectors';
import { LineOfLoggingResult } from '@ofModel/line-of-logging-result.model';


@Injectable()
export class TranslateEffects {

    /**
     Class use to launch loading of translation file specific to business processes

     All translation are loaded after all processes definition has been loaded
     These translation are loaded only for last process definition version
     So when loading cards or archives cards, we need to check if translation has been loaded
     because they can use old version of process definition
    */

    private static translationsAlreadyLoaded = new Set<string>();

    constructor(private actions$: Actions,
        private translateService: TranslateService,
        private processesService: ProcessesService,
        private store: Store<AppState>) {
        this.loadTranslationIfNeededAfterLoadingArchiveCard();
        this.loadTranslationIfNeededAfterLoadingLoggingCard();
    }


    @Effect()
    initProcessesTranslations: Observable<TranslateActions> = this.actions$
        .pipe(
            ofType(TranslateActionsTypes.LoadProcessesTranslation)
            , map(() =>  this.processesService.getAllProcesses().forEach(process => this.loadTranslationsForProcess(process)))
            , map(() => {
                console.log(new Date().toISOString(), 'Translation for processes loaded');
                return new TranslationUpdateDone();
            }));

    @Effect()
    loadTranslationifNeededAfterLoadingCards: Observable<TranslateActions> = this.actions$
        .pipe(
            ofType(LightCardActionTypes.LoadLightCardsSuccess)
            , map((loadedCardAction: LoadLightCardsSuccess) => loadedCardAction.payload.lightCards)
            , map((cards: LightCard[]) => cards.forEach(card => this.loadTranslationsForCard(card)))
            , map(() => new TranslationUpdateDone())
        );


    private loadTranslationIfNeededAfterLoadingArchiveCard() {
        this.store.pipe(
            select(selectArchiveLightCards))
            .subscribe(cards => { cards.forEach(card => this.loadTranslationsForCard(card)); return of(); });
    }

    private loadTranslationIfNeededAfterLoadingLoggingCard() {
        this.store.pipe(
            select(selectLinesOfLoggingResult))
            .subscribe(lines => { lines.forEach(loggingResult => this.loadTranslationsForLoggingResult(loggingResult)); return of(); });
    }

    private loadTranslationsForProcess(process: Process) {
        this.translateService.getLangs().forEach(
            local => this.addTranslationIfNeeded(local, process.id, process.version));
    }

    private loadTranslationsForCard(card: LightCard) {
        this.translateService.getLangs().forEach(
            local => this.addTranslationIfNeeded(local, card.process, card.processVersion));
    }

    private loadTranslationsForLoggingResult(loggingResult: LineOfLoggingResult) {
        this.translateService.getLangs().forEach(
            local => this.addTranslationIfNeeded(local, loggingResult.process, loggingResult.processVersion));
    }

    private addTranslationIfNeeded(locale: string, process: string, version: string) {
        if (!TranslateEffects.translationsAlreadyLoaded.has(locale + '/' + process + '/' + version)) {
            TranslateEffects.translationsAlreadyLoaded.add(locale + '/' + process + '/' + version);
            this.processesService.askForI18nJson(process, locale, version)
                .pipe(map(i18n => this.translateService.setTranslation(locale, i18n, true))).subscribe();
        }
    }
}


