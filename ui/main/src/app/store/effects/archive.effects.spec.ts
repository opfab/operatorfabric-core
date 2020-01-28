
import {getSeveralRandomLightCards} from '@tests/helpers';
import {Actions} from '@ngrx/effects';
import {hot} from 'jasmine-marbles';
import {ArchiveEffects} from '@ofEffects/archive.effects';
import {ArchiveQuerySuccess, SendArchiveQuery} from '@ofActions/archive.actions';
import {LightCard} from '@ofModel/light-card.model';
import {Page} from '@ofModel/page.model';

describe('ArchiveEffects', () => {
    let effects: ArchiveEffects;

    it('should return an ArchiveQuerySuccess after SendArchiveQuery triggers query through cardService (no paging) ', () => {
        const expectedLightCards =  getSeveralRandomLightCards();
        const expectedPage = new Page<LightCard>(1, expectedLightCards.length, expectedLightCards);
        const simulateTime = hot('-a--', {
            a: new SendArchiveQuery({
                params: new Map<string, string[]>()
            })
        });
        const localActions$ = new Actions(simulateTime);
        const localMockCardService = jasmine.createSpyObj('CardService', ['fetchArchivedCards']);

        const mockStore = jasmine.createSpyObj('Store', ['dispatch', 'select']);

        localMockCardService.fetchArchivedCards.and.returnValue(hot('---b', {b: expectedPage}));
        const expectedAction = new ArchiveQuerySuccess({resultPage: expectedPage});
        const localExpected = hot('---c', {c: expectedAction});

        effects = new ArchiveEffects(mockStore, localActions$, localMockCardService);
        expect(effects).toBeTruthy();
        expect(effects.queryArchivedCards).toBeObservable(localExpected);
    });

});
