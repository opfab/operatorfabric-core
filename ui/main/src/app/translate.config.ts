
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
