/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Injectable} from '@angular/core';
import * as moment from 'moment-timezone';
import {TranslateService} from "@ngx-translate/core";

@Injectable()
export class I18nService {

    constructor(private translate: TranslateService) {
    }

    public changeLocale(locale:string){
        moment.locale(locale);
        this.translate.use(locale);
    }

    public configureI18nWithEnglishAsDefault() {
        this.translate.setDefaultLang('en');
        const browserLang = this.translate.getBrowserLang();
        this.changeLocale(browserLang);
    }
}
