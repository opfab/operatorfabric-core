import {TranslateLoader, TranslateModuleConfig} from "@ngx-translate/core";
import {HttpClient} from "@angular/common/http";
import {TranslateHttpLoader} from "@ngx-translate/http-loader";


export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http,"/home/assets/i18n/",".json");
}

export const translateConfig:TranslateModuleConfig = {
    loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
    }
};