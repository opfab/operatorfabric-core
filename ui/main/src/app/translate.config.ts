/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {TranslateLoader, TranslateModuleConfig} from "@ngx-translate/core";
import {HttpClient} from "@angular/common/http";
import {TranslateHttpLoader} from "@ngx-translate/http-loader";
import {environment} from "@env/environment";

const i18nPath = "/assets/i18n/"
const prodI18nPath = "/ui/assets/i18n/"

export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http,environment.production?prodI18nPath:i18nPath,".json");
}

export const translateConfig:TranslateModuleConfig = {
    loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
    }
};
