/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

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

    @Override
    public Map<String, ? extends Action> getActions(){
        return actionsData;
    }

    @Override
    public void setActions(Map<String, ? extends Action> actionsData){
        this.actionsData = new HashMap<>((Map<String,ActionData>) actionsData);
    }

}
