
import {reducer} from './light-card.reducer';
import {CardFeedState, feedInitialState, LightCardAdapter} from '@ofStates/feed.state';
import {createEntityAdapter} from "@ngrx/entity";
import {LightCard} from "@ofModel/light-card.model";
import {getOneRandomLigthCard, getRandomAlphanumericValue, getSeveralRandomLightCards} from "@tests/helpers";
import {
    AddLightCardFailure,
    ClearLightCardSelection,
    EmptyLightCards,
    LoadLightCardsFailure,
    LoadLightCardsSuccess
} from "@ofActions/light-card.actions";
import {ApplyFilter, InitFilters} from "@ofActions/feed.actions";
import {Filter} from "@ofModel/feed-filter.model";
import {FilterType} from "@ofServices/filter.service";

describe('LightCard Reducer', () => {

  const lightCardEntityAdapter = createEntityAdapter<LightCard>();


  describe('unknown action', () => {
    it('should return the initial state on initial state', () => {
      const action = {} as any;

      const result = reducer(feedInitialState, action);

      expect(result).toBe(feedInitialState);
    });

    it('should return the previous state on living state', () => {
      const action = {} as any;

      const previousState = lightCardEntityAdapter.addOne(getOneRandomLigthCard(),feedInitialState);
      const result = reducer(previousState,action);
      expect(result).toBe(previousState);
    });

  });

  describe('LoadLightCardsFailure', () => {
    it('should leave state unchanged with an additional message message', () =>{


      const severalRandomLightCards = getSeveralRandomLightCards(5);

      const previousState = lightCardEntityAdapter.addAll(severalRandomLightCards,feedInitialState);

      const currentError = new Error(getRandomAlphanumericValue(5,12));
      const loadLightCardsFailureAction = new LoadLightCardsFailure({error: currentError});

      const actualState = reducer(previousState,loadLightCardsFailureAction);
      expect(actualState).toBeTruthy();
      expect(actualState.loading).toEqual(previousState.loading);
      expect(actualState.entities).toEqual(previousState.entities);
      const actualError = actualState.error;
      expect(actualError).not.toEqual(previousState.error);
      expect(actualError).toEqual(`error while loading cards: '${currentError}'`)

    });
  });
    describe('EmptyLightCards', () => {
        it('should empty entities', () =>{
            const severalRandomLightCards = getSeveralRandomLightCards(5);
            const previousState = lightCardEntityAdapter.addAll(severalRandomLightCards,feedInitialState);
            const actualState = reducer(previousState,new EmptyLightCards());
            expect(actualState).toBeTruthy();
            expect(actualState.loading).toEqual(false);
            expect(lightCardEntityAdapter.getSelectors().selectTotal(actualState)).toEqual(0);
            expect(actualState.lastCards).toEqual([]);
        });
    });

    describe('LoadLightCardsSuccess', () => {
        it('should add cards to state', () =>{
            const severalRandomLightCards = getSeveralRandomLightCards(5);
            const actualState = reducer(feedInitialState,new LoadLightCardsSuccess({lightCards:severalRandomLightCards}));
            expect(actualState).toBeTruthy();
            expect(actualState.loading).toEqual(false);
            expect(lightCardEntityAdapter.getSelectors().selectAll(actualState).map(c=>c.id).sort())
                .toEqual(severalRandomLightCards.map(c=>c.id).sort());
            expect(actualState.lastCards.map(c=>c.id).sort()).toEqual(severalRandomLightCards.map(c=>c.id).sort());
        });
    });

  describe('AddLightCardFailure', () => {
    it('should leave state unchanged with an additional message message', () => {
      const severalRandomLightCards = getSeveralRandomLightCards(5);
      const previousState = lightCardEntityAdapter.addAll(severalRandomLightCards,feedInitialState);

      const currentError = new Error(getRandomAlphanumericValue(5,12));
      const addLightCardFailureAction= new AddLightCardFailure({error:currentError});

      const actualState = reducer(previousState, addLightCardFailureAction);

      expect(actualState).toBeTruthy();
      expect(actualState.loading).toEqual(previousState.loading);
      expect(actualState.entities).toEqual(previousState.entities);
      const actualError = actualState.error;
      expect(actualError).not.toEqual(previousState.error);
      expect(actualError).toEqual(`error while adding a single lightCard: '${currentError}'`)

    });
  });

    describe('init filter action', () => {
        it('should return initial state with an additionnal filter', () => {
            const filters = new Map();
            const testFilter = new Filter(
                (card,status)=>true,
                false,
                {}
            );
            filters.set(FilterType.TEST_FILTER,testFilter);

            expect(feedInitialState.filters.size).toBe(0);
            const result = reducer(feedInitialState, new InitFilters({filters:filters}));

            expect(result.filters.size).toBe(1);
            expect(result.filters.get(FilterType.TEST_FILTER)).toBe(testFilter);
            expect(result.filters.get(FilterType.TEST_FILTER).funktion).toBe(testFilter.funktion);
        });

    });

    describe('apply filter action', () => {
        it('should return initial state if the filter is not in state', () => {
            const action = new ApplyFilter({
                name: FilterType.TEST_FILTER,
                active: true,
                status: {}
            });

            expect(feedInitialState.filters.size).toBe(0);
            const result = reducer(feedInitialState, action);
            expect(feedInitialState.filters.size).toBe(0);

            expect(result).toEqual(feedInitialState);
        });
        it('should return state with filter updated', () => {
            const filter = new Filter(
                (card,status)=>true,
                false,
                {})
            const previousState = {...feedInitialState, filters: new Map()}
            previousState.filters.set(FilterType.TEST_FILTER, filter);

            const action = new ApplyFilter({
                name: FilterType.TEST_FILTER,
                active: true,
                status: {prop: 'value'}
            });

            expect(previousState.filters.size).toBe(1);
            expect(previousState.filters.get(FilterType.TEST_FILTER)).not.toBeNull();
            expect(previousState.filters.get(FilterType.TEST_FILTER).active).toBeFalsy();
            const result = reducer(previousState, action);

            expect(result.filters.size).toBe(1);
            expect(result.filters.get(FilterType.TEST_FILTER)).not.toBeNull();
            expect(result.filters.get(FilterType.TEST_FILTER).active).toBeTruthy();
            expect(result.filters.get(FilterType.TEST_FILTER).status.prop).toBe('value');
        });

    });

    describe('ClearLightCardSelection', () => {

        it('should clear the selected card', () => {
            const action = new ClearLightCardSelection();
            const previousState: CardFeedState = LightCardAdapter.getInitialState(
                {
                    selectedCardId: getRandomAlphanumericValue(5,10),
                    lastCards: [],
                    loading: false,
                    error: '',
                    filters: new Map()
                });

            const expectedState: CardFeedState = LightCardAdapter.getInitialState(
                {
                    selectedCardId: null,
                    lastCards: [],
                    loading: false,
                    error: '',
                    filters: new Map()
                });

            const result = reducer(previousState, action);

            expect(result).toEqual(expectedState);

        });

    });

});
