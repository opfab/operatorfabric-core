package org.lfenergy.operatorfabric.actions.model;

import lombok.Data;

import java.util.List;

@Data
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
}
