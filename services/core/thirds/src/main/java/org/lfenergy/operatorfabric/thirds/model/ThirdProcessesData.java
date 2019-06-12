package org.lfenergy.operatorfabric.thirds.model;

import lombok.*;

import java.util.HashMap;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ThirdProcessesData implements ThirdProcesses{

    @Singular("statesData")
    private Map<String,ThirdStatesData> statesData;

    @Override
    public Map<String, ? extends ThirdStates> getStates(){
        return statesData;
    }

    @Override
    public void setStates(Map<String, ? extends ThirdStates> statesData){
        this.statesData = new HashMap<>((Map<String,ThirdStatesData>) statesData);
    }
}
