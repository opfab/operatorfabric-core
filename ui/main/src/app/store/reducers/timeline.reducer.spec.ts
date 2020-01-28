
import {reducer} from './timeline.reducer';
import {timelineInitialState} from "@ofStates/timeline.state";

describe('Timeline Reducer', () => {
    describe('unknown action', () => {
        it('should return the initial state on initial state', () => {
            const action = {} as any;

            const result = reducer(timelineInitialState, action);

            expect(result).toBe(timelineInitialState);
        });
    });
});
