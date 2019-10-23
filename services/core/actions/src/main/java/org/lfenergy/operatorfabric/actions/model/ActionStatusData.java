package org.lfenergy.operatorfabric.actions.model;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ActionStatusData implements ActionStatus {
    private Boolean lockAction;
    private Boolean lockCard;
    private Boolean needsConfirm;
    private Boolean called;
    private Boolean updateState;
    private Boolean updateStateBeforeAction;
    private String contentStyle;
    private String buttonStyle;
    private I18n label;
    private List< ? extends Input> inputs;

    public static ActionStatus fromAction(Action action) {
        ActionStatusData.ActionStatusDataBuilder result = ActionStatusData.builder()
                .lockAction(action.getLockAction())
                .lockCard(action.getLockCard())
                .needsConfirm(action.getNeedsConfirm())
                .called(action.getCalled())
                .updateState(action.getUpdateState())
                .updateStateBeforeAction(action.getUpdateStateBeforeAction())
                .contentStyle(action.getContentStyle())
                .buttonStyle(action.getButtonStyle())
                ;
        if(action.getLabel()!=null){
            I18nData.I18nDataBuilder labelBuilder = I18nData.builder().key(action.getLabel().getKey());
            if(action.getLabel().getParameters()!=null)
                labelBuilder.parameters(action.getLabel().getParameters());
            result.label(labelBuilder.build());
        }
        if(action.getInputs()!=null)
            result.inputs(action.getInputs());
        return result.build();
    }
}
