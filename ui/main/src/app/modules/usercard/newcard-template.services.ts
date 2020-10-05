import {Injectable} from '@angular/core';


import {Map} from '@ofModel/map';
import {ProcessesService} from '@ofServices/processes.service';
import {Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import {buildSettingsOrConfigSelector} from '@ofSelectors/settings.x.config.selectors';
import {Observable, of} from 'rxjs';


@Injectable()
export class NewCardTemplateService {

    private templateCache: Map<string> = new Map();
    private _locale: string;


    constructor(private businessconfig: ProcessesService, private store: Store<AppState>) {
        this.store.select(buildSettingsOrConfigSelector('locale')).subscribe(locale => this.changeLocale(locale));
    }


    public changeLocale(locale: string){
        if (!!locale) {
            this._locale = locale;
        } else {
            this._locale = 'en';
        }
    }

    public getTemplate(process: string, version: string, name: string ): Observable<string> {
        const locale = this._locale;
        const key = `${process}.${version}.${name}.${locale}`;
        const template = this.templateCache[key];
        if (!!template) {
           return of(template);
        }

        const response =  this.businessconfig.fetchHbsTemplate(process, version, name, locale);
        response.subscribe((newTemplate) => this.templateCache[key] = newTemplate);
        return response;
    }
}
