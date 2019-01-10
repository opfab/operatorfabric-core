import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {CardComponent} from "./components/card/card.component";
import {CardDetailsComponent} from "./components/card-details/card-details.component";
import {DetailsComponent} from "./components/details/details.component";
import {DetailComponent} from "./components/detail/detail.component";

@NgModule({
  declarations: [CardComponent, CardDetailsComponent, DetailsComponent, DetailComponent],
  imports: [
    CommonModule
  ],
    exports: [CardComponent, CardDetailsComponent, DetailsComponent, DetailComponent]
})
export class CardsModule { }
