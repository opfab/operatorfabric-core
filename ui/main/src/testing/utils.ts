import {Injectable, NgModule} from '@angular/core';
import {ActionsSubject, ReducerManager, StateObservable, Store, StoreModule} from '@ngrx/store';
import {BehaviorSubject} from 'rxjs';
import {RouterTestingModule} from '@angular/router/testing';

/*
inspired by https://tomastrajan.github.io/angular-ngrx-material-starter
 */

@Injectable()
export class MockStore<T> extends Store<T> {
    private stateSubject = new BehaviorSubject<T>({} as T);

    constructor(
        state$: StateObservable,
        actionsObserver: ActionsSubject,
        reducerManager: ReducerManager
    ) {
        super(state$, actionsObserver, reducerManager);
        this.source = this.stateSubject.asObservable();
    }

    setState(nextState: T) {
        this.stateSubject.next(nextState);
    }
}

export function provideMockStore() {
    return {
        provide: Store,
        useClass: MockStore
    };
}

@NgModule({
    imports: [
        RouterTestingModule,
        StoreModule.forRoot({})
    ],
    exports: [
        RouterTestingModule,
    ],
    providers: [provideMockStore()]
})
export class TestingModule {
    constructor() {}
}
