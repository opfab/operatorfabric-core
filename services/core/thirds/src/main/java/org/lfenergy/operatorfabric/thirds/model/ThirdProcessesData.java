/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


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
    private String name;

    @Override
    public Map<String, ? extends ThirdStates> getStates(){
        return statesData;
    }

    @Override
    public void setStates(Map<String, ? extends ThirdStates> statesData){
        this.statesData = new HashMap<>((Map<String,ThirdStatesData>) statesData);
    }
}
