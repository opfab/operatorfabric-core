/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


import {Injectable} from '@angular/core';
import * as moment from 'moment-timezone';
import {TranslateService} from "@ngx-translate/core";
import {HttpClient} from "@angular/common/http";
import {Store} from "@ngrx/store";
import {AppState} from "@ofStore/index";
import {buildSettingsOrConfigSelector} from "@ofSelectors/settings.x.config.selectors";
import {combineLatest,Observable} from "rxjs";
import {environment} from "@env/environment";

@Injectable()
export class I18nService {

    private _locale:string;
    private _timeZone:string;
    private static loadedLocales = new Set<String>();
    private static localUrl = "";

    constructor(private httpClient: HttpClient,private translate: TranslateService,private store: Store<AppState>) {
        const i18nPath = "/assets/i18n/"
        const prodI18nPath = "/ui/assets/i18n/"
        I18nService.localUrl = environment.production?prodI18nPath:i18nPath;
        combineLatest(
        this.store.select(buildSettingsOrConfigSelector('locale')),
        this.store.select(buildSettingsOrConfigSelector('timeZone' )))

            .subscribe(([locale,timeZone]) =>this.changeLocale(locale, timeZone));

    }

    public changeLocale(locale:string, timeZone: string){

        if(locale) {
            this._locale = locale;
        }else{
            this._locale = 'en';
        }
        if  (!I18nService.loadedLocales.has(this._locale)) this.loadLocale(this._locale);
        moment.locale(this._locale);
        this.translate.use(this._locale);
        if(timeZone) {
            this._timeZone = timeZone;
        }else{
            timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        }
        moment.tz.setDefault(timeZone);
    }

    public get locale(){
        return this._locale;
    }

    public get timeZone(){
        return this._timeZone;
    }


   private loadLocale(locale:string ) {
        this.httpClient.get(`${I18nService.localUrl}${locale}.json`).subscribe(translation => {
            I18nService.loadedLocales.add(locale);
            this.translate.setTranslation(locale,translation,true);
        },
        error => console.log(`Error : impossible to load locale ${I18nService.localUrl}${locale}.json`)); 
    }


}
