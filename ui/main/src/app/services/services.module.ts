
import {ModuleWithProviders, NgModule, Optional, SkipSelf} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {AuthenticationService} from './authentication/authentication.service';
import {TokenInjector} from './interceptors.service';
import {CardService} from './card.service';
import {GuidService} from '@ofServices/guid.service';
import {TimeService} from '@ofServices/time.service';
import {ThirdsService} from '@ofServices/thirds.service';
import {FilterService} from '@ofServices/filter.service';
import {ConfigService} from '@ofServices/config.service';
import {I18nService} from '@ofServices/i18n.service';
import {SettingsService} from '@ofServices/settings.service';
import { UserService } from './user.service';
import {ThirdActionService} from '@ofServices/third-action.service';
import { NotifyService } from '@ofServices/notify.service';

@NgModule({
    imports: [
        CommonModule
    ],
    providers: [
        ConfigService,
        SettingsService,
        CardService,
        AuthenticationService,
        TimeService,
        ThirdsService,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: TokenInjector,
            multi: true
        }   ,
        GuidService,
        FilterService,
        I18nService,
        UserService,
        ThirdActionService,
        NotifyService
    ]
})
export class ServicesModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: ServicesModule
        };
    }

    constructor(
        @Optional()
        @SkipSelf()
            parentModule: ServicesModule
    ) {
        if (parentModule) {
            throw new Error(
                'ServicesModule is already loaded. Import it in the AppModule only'
            );
        }
    }
}

