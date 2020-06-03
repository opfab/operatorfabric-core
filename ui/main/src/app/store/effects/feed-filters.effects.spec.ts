

import {Actions} from '@ngrx/effects';
import {hot} from 'jasmine-marbles';
import {FeedFiltersEffects} from "@ofEffects/feed-filters.effects";
import {ApplyFilter} from "@ofActions/feed.actions";
import {LoadSettingsSuccess} from "@ofActions/settings.actions";
import {of} from "rxjs";
import {FilterService, FilterType} from "@ofServices/filter.service";
import {async, TestBed} from "@angular/core/testing";
import {Store} from "@ngrx/store";
import {AppState} from "@ofStore/index";
import createSpyObj = jasmine.createSpyObj;
import SpyObj = jasmine.SpyObj;


describe('FeedFilterEffects', () => {
    let effects: FeedFiltersEffects;
    let mockStore:SpyObj<Store<AppState>>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            providers: [
                {provide: FilterService, useValue: createSpyObj('FilterService', ['defaultFilters'])},
                {provide: Store, useValue: createSpyObj('Store', ['dispatch', 'select'])}
            ]
        });

    }));
    beforeEach(() => {
        mockStore = TestBed.get(Store);
    });

    describe('initTagFilterOnLoadedSettings', () => {
        it('should return nothing if no default tags', () => {
            const localActions$ = new Actions(hot('a', {a: new LoadSettingsSuccess({settings:{}})}));

            const localExpected = hot('', {});

            mockStore.select.and.returnValue(of(null));
            effects = new FeedFiltersEffects(mockStore, localActions$);

            expect(effects).toBeTruthy();
            expect(effects.initTagFilterOnLoadedSettings).toBeObservable(localExpected);
        });
        it('should return nothing if default tags is set to null', () => {
            const localActions$ = new Actions(hot('a', {a: new LoadSettingsSuccess({settings:{defaultTags:null}})}));

            const localExpected = hot('', {c:new ApplyFilter({name:FilterType.TAG_FILTER,active:true,status:{tags:['test1']}})});

            mockStore.select.and.returnValue(of(null));
            effects = new FeedFiltersEffects(mockStore, localActions$);

            expect(effects).toBeTruthy();
            expect(effects.initTagFilterOnLoadedSettings).toBeObservable(localExpected);
        });
        it('should return nothing if default tags is set to empty', () => {
            const localActions$ = new Actions(hot('a', {a: new LoadSettingsSuccess({settings:{defaultTags:[]}})}));

            const localExpected = hot('', {c:new ApplyFilter({name:FilterType.TAG_FILTER,active:true,status:{tags:['test1']}})});

            mockStore.select.and.returnValue(of(null));
            effects = new FeedFiltersEffects(mockStore, localActions$);

            expect(effects).toBeTruthy();
            expect(effects.initTagFilterOnLoadedSettings).toBeObservable(localExpected);
        });
        it('should return ApplyFilter with settings value if default tags is set in settings', () => {
            const localActions$ = new Actions(hot('-a', {a: new LoadSettingsSuccess({settings:{defaultTags:['test1']}})}));

            const localExpected = hot('-c', {c:new ApplyFilter({name:FilterType.TAG_FILTER,active:true,status:{tags:['test1']}})});

            mockStore.select.and.returnValue(of(null));
            effects = new FeedFiltersEffects(mockStore, localActions$);

            expect(effects).toBeTruthy();
            expect(effects.initTagFilterOnLoadedSettings).toBeObservable(localExpected);
        });
        it('should return ApplyFilter with settings value if default tags is set in settings over default configuration', () => {
            const localActions$ = new Actions(hot('-a', {a: new LoadSettingsSuccess({settings:{defaultTags:['test1']}})}));

            const localExpected = hot('-c', {c:new ApplyFilter({name:FilterType.TAG_FILTER,active:true,status:{tags:['test1']}})});

            mockStore.select.and.returnValue(of(['test2']));
            effects = new FeedFiltersEffects(mockStore, localActions$);

            expect(effects).toBeTruthy();
            expect(effects.initTagFilterOnLoadedSettings).toBeObservable(localExpected);
        });
        it('should return ApplyFilter with default config value if default tags is null set in settings', () => {
            const localActions$ = new Actions(hot('-a', {a: new LoadSettingsSuccess({settings:{defaultTags:null}})}));

            const localExpected = hot('-c', {c:new ApplyFilter({name:FilterType.TAG_FILTER,active:true,status:{tags:['test2']}})});

            mockStore.select.and.returnValue(of(['test2']));
            effects = new FeedFiltersEffects(mockStore, localActions$);

            expect(effects).toBeTruthy();
            expect(effects.initTagFilterOnLoadedSettings).toBeObservable(localExpected);
        });
        it('should return ApplyFilter with default config value if default tags is empty set in settings', () => {
            const localActions$ = new Actions(hot('-a', {a: new LoadSettingsSuccess({settings:{defaultTags:[]}})}));

            const localExpected = hot('-c', {c:new ApplyFilter({name:FilterType.TAG_FILTER,active:true,status:{tags:['test2']}})});

            mockStore.select.and.returnValue(of(['test2']));
            effects = new FeedFiltersEffects(mockStore, localActions$);

            expect(effects).toBeTruthy();
            expect(effects.initTagFilterOnLoadedSettings).toBeObservable(localExpected);
        });
    });


});
