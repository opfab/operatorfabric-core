
import {Injectable} from '@angular/core';
import * as moment from 'moment-timezone';
import {TranslateService} from "@ngx-translate/core";
import {Store} from "@ngrx/store";
import {AppState} from "@ofStore/index";
import {buildSettingsOrConfigSelector} from "@ofSelectors/settings.x.config.selectors";
import {combineLatest} from "rxjs";

@Injectable()
export class I18nService {

    private _locale:string;
    private _timeZone:string;

    constructor(private translate: TranslateService,private store: Store<AppState>) {
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

}
