/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Observable, Subject} from 'rxjs';
import {catchError, takeUntil, tap} from 'rxjs/operators';
import {ConfigService} from 'app/services/config/ConfigService';
import {Utilities} from 'app/business/common/utilities';
import {ConfigServer} from '../../../services/config/server/ConfigServer';
import {ServerResponseStatus} from '../../server/serverResponse';
import {TranslationService} from './translation.service';
import {LoggerService as logger} from 'app/services/logs/LoggerService';
import {environment} from '@env/environment';

declare const opfab: any;

export class I18nService {
    private static readonly localUrl = `${environment.url}assets/i18n/`;
    private static _locale: string;
    private static configServer: ConfigServer;
    private static translationService: TranslationService;
    private static readonly destroy$ = new Subject<void>();

    public static setConfigServer(configServer: ConfigServer) {
        this.configServer = configServer;
    }

    public static setTranslationService(translationService: TranslationService) {
        this.translationService = translationService;
    }

    public static initLocale() {
        this.destroy$.next(); // unsubscribe from previous subscription , only useful for unit tests as we init more than one time
        ConfigService.getConfigValueAsObservable('settings.locale', 'en')
            .pipe(takeUntil(I18nService.destroy$))
            .subscribe((locale) => I18nService.changeLocale(locale));
    }

    public static changeLocale(locale: string) {
        if (locale) {
            this._locale = locale;
        } else {
            this._locale = 'en';
        }
        this.translationService.setLang(this._locale);
        this.setTranslationForMultiSelectUsedInTemplates();
        this.setTranslationForRichTextEditor();
    }

    public static setTranslationForMultiSelectUsedInTemplates() {
        opfab.multiSelect.searchPlaceholderText = this.translationService.getTranslation(
            'multiSelect.searchPlaceholderText'
        );
        opfab.multiSelect.clearButtonText = this.translationService.getTranslation('multiSelect.clearButtonText');
        opfab.multiSelect.noOptionsText = this.translationService.getTranslation('multiSelect.noOptionsText');
        opfab.multiSelect.noSearchResultsText = this.translationService.getTranslation(
            'multiSelect.noSearchResultsText'
        );
    }

    public static setTranslationForRichTextEditor() {
        const root = document.documentElement;
        root.style.setProperty(
            '--opfab-richtext-link-enter',
            '"' + this.translationService.getTranslation('userCard.richTextEditor.enterLink') + '"'
        );
        root.style.setProperty(
            '--opfab-richtext-link-visit',
            '"' + this.translationService.getTranslation('userCard.richTextEditor.visitLink') + '"'
        );

        root.style.setProperty(
            '--opfab-richtext-link-save',
            '"' + this.translationService.getTranslation('userCard.richTextEditor.saveLink') + '"'
        );

        root.style.setProperty(
            '--opfab-richtext-link-edit',
            '"' + this.translationService.getTranslation('userCard.richTextEditor.editLink') + '"'
        );
        root.style.setProperty(
            '--opfab-richtext-link-remove',
            '"' + this.translationService.getTranslation('userCard.richTextEditor.removeLink') + '"'
        );
    }

    public static get locale() {
        return this._locale;
    }

    public static loadLocale(locale: string): Observable<any> {
        return this.configServer.getLocale(locale).pipe(
            tap({
                next: (serverResponse) => {
                    if (serverResponse.status === ServerResponseStatus.OK) {
                        this.translationService.setTranslation(locale, serverResponse.data, true);
                    } else {
                        logger.error(`Impossible to load locale ${I18nService.localUrl}${locale}.json`);
                    }
                }
            })
        );
    }

    public static loadGlobalTranslations(locales: Array<string>): Observable<any[]> {
        if (locales) {
            const localeRequests$ = [];
            locales.forEach((locale) => localeRequests$.push(this.loadLocale(locale)));
            return Utilities.subscribeAndWaitForAllObservablesToEmitAnEvent(localeRequests$);
        }
    }

    public static loadTranslationForMenu(): void {
        ConfigService.fetchMenuTranslations().subscribe((locales) => {
            locales.forEach((locale) => {
                this.translationService.setTranslation(locale.language, locale.i18n, true);
            });
        });

        catchError((err, caught) => {
            logger.error('Impossible to load configuration file ui-menu.json' + JSON.stringify(err));
            return caught;
        });
    }
}
