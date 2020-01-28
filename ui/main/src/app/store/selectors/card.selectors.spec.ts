
import {AppState} from '@ofStore/index';
import {cardInitialState, CardState} from '@ofStates/card.state';
import {emptyAppState4Test , getOneRandomCard} from '@tests/helpers';
import {
    selectCardState,
    selectCardStateSelected,
    selectCardStateSelectedDetails,
    selectCardStateSelectedId,
    selectCardActionsAppearState
} from '@ofSelectors/card.selectors';

describe('ConfigSelectors', () => {
    const emptyAppState: AppState = emptyAppState4Test;
    const selectedState: CardState = {
        ...cardInitialState,
        selected: getOneRandomCard()
    };

    it('manage empty card state', () => {
        const testAppState = {...emptyAppState, card: cardInitialState};
        expect(selectCardState(testAppState)).toEqual(cardInitialState);
        expect(selectCardStateSelected(testAppState)).toBeNull();
        expect(selectCardStateSelectedDetails(testAppState)).toBeNull();
        expect(selectCardStateSelectedId(testAppState)).toBeNull();
    });
    it('manage slected card state', () => {
        const testAppState = {...emptyAppState, card: selectedState};
        expect(selectCardState(testAppState)).toEqual(selectedState);
        expect(selectCardStateSelected(testAppState)).toEqual(selectedState.selected);
        expect(selectCardStateSelectedDetails(testAppState)).toEqual(selectedState.selected.details);
        expect(selectCardStateSelectedId(testAppState)).toEqual(selectedState.selected.id);
    });
    it('should select the card appear array', () => {
        const testAppState = {...emptyAppState, card: selectedState};
        expect(selectCardActionsAppearState(testAppState)).toEqual(selectedState.actionsAppear);
    });
});
