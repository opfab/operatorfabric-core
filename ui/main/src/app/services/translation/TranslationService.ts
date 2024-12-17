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
import {ConfigServer} from '../config/server/ConfigServer';
import {ServerResponseStatus} from '../../business/server/serverResponse';
import {TranslationLib} from './lib/TranslationLib';
import {LoggerService as logger} from 'app/services/logs/LoggerService';
import {environment} from '@env/environment';

export class TranslationService {
    private static readonly localUrl = `${environment.url}assets/i18n/`;
    private static _locale: string;
    private static configServer: ConfigServer;
    private static translationLib: TranslationLib;
    private static readonly destroy$ = new Subject<void>();

    public static setConfigServer(configServer: ConfigServer) {
        this.configServer = configServer;
    }

    public static setTranslationLib(translationLib: TranslationLib) {
        this.translationLib = translationLib;
    }

    public static setLang(lang: string) {
        this.translationLib.setLang(lang);
    }

    public static getTranslation(key: string, params?: Object): string {
        return this.translationLib.getTranslation(key, params);
    }

    public static initLocale() {
        this.destroy$.next(); // unsubscribe from previous subscription , only useful for unit tests as we init more than one time
        ConfigService.getConfigValueAsObservable('settings.locale', 'en')
            .pipe(takeUntil(TranslationService.destroy$))
            .subscribe((locale) => TranslationService.changeLocale(locale));
    }

    public static changeLocale(locale: string) {
        if (locale) {
            this._locale = locale;
        } else {
            this._locale = 'en';
        }
        this.translationLib.setLang(this._locale);
        this.setTranslationForRichTextEditor();
    }

    public static setTranslationForRichTextEditor() {
        const root = document.documentElement;
        root.style.setProperty(
            '--opfab-richtext-link-enter',
            '"' + this.translationLib.getTranslation('userCard.richTextEditor.enterLink') + '"'
        );
        root.style.setProperty(
            '--opfab-richtext-link-visit',
            '"' + this.translationLib.getTranslation('userCard.richTextEditor.visitLink') + '"'
        );

        root.style.setProperty(
            '--opfab-richtext-link-save',
            '"' + this.translationLib.getTranslation('userCard.richTextEditor.saveLink') + '"'
        );

        root.style.setProperty(
            '--opfab-richtext-link-edit',
            '"' + this.translationLib.getTranslation('userCard.richTextEditor.editLink') + '"'
        );
        root.style.setProperty(
            '--opfab-richtext-link-remove',
            '"' + this.translationLib.getTranslation('userCard.richTextEditor.removeLink') + '"'
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
                        this.translationLib.setTranslation(locale, serverResponse.data, true);
                    } else {
                        logger.error(`Impossible to load locale ${TranslationService.localUrl}${locale}.json`);
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
                this.translationLib.setTranslation(locale.language, locale.i18n, true);
            });
        });

        catchError((err, caught) => {
            logger.error('Impossible to load configuration file ui-menu.json' + JSON.stringify(err));
            return caught;
        });
    }

    public static translateSeverity(severity: string): string {
        return this.translationLib.getTranslation('shared.severity.' + severity.toLowerCase());
    }
}
