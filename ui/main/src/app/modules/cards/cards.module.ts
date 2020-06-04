

import {ModuleWithProviders, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CardComponent} from "./components/card/card.component";
import {CardDetailsComponent} from "./components/card-details/card-details.component";
import {DetailsComponent} from "./components/details/details.component";
import {DetailComponent} from "./components/detail/detail.component";
import {TranslateModule} from "@ngx-translate/core";
import {ThirdsService} from "../../services/thirds.service";
import {HandlebarsService} from "./services/handlebars.service";
import {UtilitiesModule} from "../utilities/utilities.module";
import {ActionComponent} from './components/action/action.component';
import {NgbModule} from "@ng-bootstrap/ng-bootstrap";
import {ConfirmModalComponent} from "./components/action/confirm-modal/confirm-modal.component";

@NgModule({
  declarations: [CardComponent
      , CardDetailsComponent
      , DetailsComponent
      , DetailComponent
      , ActionComponent
      , ConfirmModalComponent],
  imports: [
    CommonModule,
      TranslateModule,
      UtilitiesModule,
      NgbModule
  ],
    exports: [CardComponent
        , CardDetailsComponent
        , DetailsComponent
        , DetailComponent
        , ConfirmModalComponent
    ],
    providers: [HandlebarsService],
    entryComponents: [ConfirmModalComponent]
})
export class CardsModule {
    static forRoot(): ModuleWithProviders{
        return {
            ngModule: CardsModule,
            providers: [ThirdsService]
        }
    }
}
