package org.lfenergy.operatorfabric.actions.model;

import lombok.Data;

import java.util.List;

@Data
public class ActionData implements Action {
    private ActionEnum type;
    private String url;
    private Boolean lockAction;
    private Boolean lockCard;
    private Boolean needsConfirm;
    private Boolean called;
    private Boolean updateState;
    private Boolean updateStateBeforeAction;
    private Boolean hidden;
    private String contentStyle;
    private String buttonStyle;
    private I18n label;
    private List< ? extends Input> inputs;
}
