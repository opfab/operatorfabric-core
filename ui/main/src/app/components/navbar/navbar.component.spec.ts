import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {NavbarComponent} from './navbar.component';
import {NgbModule} from "@ng-bootstrap/ng-bootstrap";
import {RouterTestingModule} from "@angular/router/testing";
import {Store, StoreModule} from "@ngrx/store";
import {AppState} from "@state/app.interface";
import {getCurrentUrl} from "@state/app.reducer";
import {of} from "rxjs";
import * as fromReducers from "@state/app.reducer";

describe('NavbarComponent', () => {

    let store: Store<AppState>;

    let component: NavbarComponent;
    let fixture: ComponentFixture<NavbarComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [NgbModule.forRoot(),
                RouterTestingModule,
                StoreModule.forRoot(fromReducers.appReducer),],
            declarations: [NavbarComponent],
            providers: [{provide: store, useClass: Store}]
        })
            .compileComponents();
        store = TestBed.get(Store);
        spyOn(store, 'dispatch').and.callThrough();
        // avoid exceptions during construction and init of the component
        spyOn(store, 'select').and.callFake((obj) => {
            if (obj === getCurrentUrl) {
                // called in ngOnInit and passed to mat-tab-link
                return of('/test/url');
            }
            console.log('passed');
            return of({});
        });
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(NavbarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
