import {monitoringInitialSate, MonitoringState} from '@ofStates/monitoring.state';
import {MonitoringAction, MonitoringActionType} from '@ofActions/monitoring.actions';

export function reducer(state = monitoringInitialSate, action: MonitoringAction): MonitoringState {
    switch (action.type) {
        case(MonitoringActionType.UpdateMonitoringFilter): {
            return {
                ...state,
                filters: action.payload.filters
            };
        }
        default: {
            return state;
        }
    }
}
