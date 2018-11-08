import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LightCardsListComponent} from './components/light-cards-list/light-cards-list.component';
import {MatButtonModule, MatCardModule, MatListModule} from '@angular/material';
import {LightCardsComponent} from './light-cards.component';
import {FormsModule} from '@angular/forms';
import {StateModule} from '../../state/state.module';
import {LightCardDetailsComponent} from './components/light-card-details/light-card-details.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatListModule,
    MatCardModule,
    MatButtonModule,

    StateModule
  ],
  declarations: [LightCardsListComponent, LightCardsComponent, LightCardDetailsComponent],
  exports: [LightCardsComponent]
})
export class LightCardsModule {
}
