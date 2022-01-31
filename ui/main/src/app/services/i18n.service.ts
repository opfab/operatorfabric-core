/* Copyright (c) 2018-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



import {Injectable} from '@angular/core';
import * as moment from 'moment';
import {TranslateService} from '@ngx-translate/core';
import {HttpClient} from '@angular/common/http';
import {Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import {buildSettingsOrConfigSelector} from '@ofSelectors/settings.x.config.selectors';
import {Observable} from 'rxjs';
import {environment} from '@env/environment';
import { tap } from 'rxjs/operators';

@Injectable()
export class I18nService {


    private static localUrl = '/assets/i18n/';
    private _locale: string;


    constructor(private httpClient: HttpClient, private translate: TranslateService, private store: Store<AppState>) {
        I18nService.localUrl = `${environment.paths.i18n}`;
        this.store.select(buildSettingsOrConfigSelector('locale')).subscribe((locale) => this.changeLocale(locale));

    }

    public changeLocale(locale: string) {

        if (locale) {
            this._locale = locale;
        } else {
            this._locale = 'en';
        }
        moment.locale(this._locale);
        this.translate.use(this._locale);
    }

    public get locale() {
        return this._locale;
    }


    public loadLocale(locale: string): Observable<any> {
        return this.httpClient.get(`${I18nService.localUrl}${locale}.json`).pipe( tap({
            next: translation => this.translate.setTranslation(locale, translation, true),
            error: error => console.log(new Date().toISOString(),`Error : impossible to load locale ${I18nService.localUrl}${locale}.json`)
        }));
    }


}
