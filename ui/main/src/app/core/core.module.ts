import {ModuleWithProviders, NgModule, Optional, SkipSelf} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CardService} from '@core/services/card.service';
import {AuthenticationService} from '@core/services/authentication.service';
import {HTTP_INTERCEPTORS} from "@angular/common/http";
import {TokenInjector} from "@core/services/interceptors.service";

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [CardService, AuthenticationService,{
    provide: HTTP_INTERCEPTORS,
    useClass: TokenInjector,
    multi: true
  }]
})
export class CoreModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: CoreModule
    };
  }

  constructor(
    @Optional()
    @SkipSelf()
      parentModule: CoreModule
  ) {
    if (parentModule) {
      throw new Error(
        'CoreModule is already loaded. Import it in the AppModule only'
      );
    }
  }
}
