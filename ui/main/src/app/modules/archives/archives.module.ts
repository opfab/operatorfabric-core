

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ArchivesRoutingModule} from './archives-routing.module';
import { ArchiveListPageComponent } from './components/archive-list/archive-list-page/archive-list-page.component';
import {ArchivesComponent} from './archives.component';
import {ArchiveListComponent} from './components/archive-list/archive-list.component';
import { ArchiveFiltersComponent } from './components/archive-filters/archive-filters.component';
import { MultiFilterComponent } from './components/archive-filters/multi-filter/multi-filter.component';
import { DatetimeFilterComponent } from './components/archive-filters/datetime-filter/datetime-filter.component';
import {CardsModule} from '../cards/cards.module';
import {TranslateModule} from '@ngx-translate/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ArchivesRoutingModule,
    CardsModule,
    TranslateModule,
    NgbModule
  ],
  declarations: [
    ArchivesComponent,
    ArchiveListComponent,
    ArchiveFiltersComponent,
    MultiFilterComponent,
    ArchiveListPageComponent,
    DatetimeFilterComponent
  ]
})
export class ArchivesModule { }
