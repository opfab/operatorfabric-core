
import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {CardListComponent} from './card-list.component';
import {CardComponent} from '../../../cards/components/card/card.component';
import {FiltersComponent} from "./filters/filters.component";
import {TypeFilterComponent} from "./filters/type-filter/type-filter.component";
import {NgbModule} from "@ng-bootstrap/ng-bootstrap";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {NO_ERRORS_SCHEMA} from "@angular/core";
import {Store, StoreModule} from "@ngrx/store";
import {appReducer, AppState, storeConfig} from "@ofStore/index";
import {FilterService} from "@ofServices/filter.service";
import {InitFilters} from "@ofActions/feed.actions";

describe('CardListComponent', () => {
    let component: CardListComponent;
    let fixture: ComponentFixture<CardListComponent>;
    let filterService: FilterService;
    let store: Store<AppState>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                NgbModule.forRoot(),
                FormsModule,
                ReactiveFormsModule,
                StoreModule.forRoot(appReducer, storeConfig)],
            declarations: [CardListComponent, CardComponent, FiltersComponent, TypeFilterComponent],
            schemas: [NO_ERRORS_SCHEMA]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        store = TestBed.get(Store);
        spyOn(store, 'dispatch').and.callThrough();
        filterService = TestBed.get(FilterService);
        store.dispatch(new InitFilters({filters: filterService.defaultFilters()}));
        fixture = TestBed.createComponent(CardListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
