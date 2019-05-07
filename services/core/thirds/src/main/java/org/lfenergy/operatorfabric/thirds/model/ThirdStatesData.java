package org.lfenergy.operatorfabric.thirds.model;

import lombok.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ThirdStatesData implements ThirdStates {
    @Singular("detailsData")
    private List<? extends Detail> detailsData;
    @Singular("actionsData")
    private Map<String, ActionData> actionsData;

    @Override
    public void setDetails(List<? extends Detail> details) {
        this.detailsData = new ArrayList<>((List < DetailData >) details);
    }

    @Override
    public List<? extends Detail> getDetails(){
        return detailsData;
    }

    public Map<String, ? extends Action> getActions(){
        return actionsData;
    }

    public void setActions(Map<String, ? extends Action> actionsData){
        this.actionsData = new HashMap<>((Map<String,ActionData>) actionsData);
    }

}
