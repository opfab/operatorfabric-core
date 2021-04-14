/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.opfab.users.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.commons.collections4.map.MultiKeyMap;

import java.util.*;

/**
 * CurrentUserWithPerimeters Model, documented at {@link CurrentUserWithPerimeters}
 *
 * {@inheritDoc}
 *
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CurrentUserWithPerimetersData implements CurrentUserWithPerimeters {
    private User userData;
    private Set<ComputedPerimeter> computedPerimeters;
    private Map<String, List<String>> processesStatesNotNotified;

    @Override
    public User getUserData(){return userData;}

    @Override
    public void setUserData(User userData){this.userData = userData;}

    @Override
    public void setComputedPerimeters(List<? extends ComputedPerimeter> computedPerimeters) {
        this.computedPerimeters = new HashSet<>(computedPerimeters);
    }

    @Override
    public List<ComputedPerimeter> getComputedPerimeters() {
        if(computedPerimeters == null)
            return Collections.emptyList();
        return new ArrayList<>(computedPerimeters);
    }

    public void computePerimeters(Set<? extends Perimeter> perimeters){
        if (perimeters == null)
            return;

        MultiKeyMap<String, List<RightsEnum>> multimapWithListOfRights = new MultiKeyMap<>();

        //First, we build a MultiKeyMap with key is (process, state) and value is a list of rights
        perimeters.forEach(perimeter -> {

            List<StateRightData> stateRights = (List<StateRightData>) perimeter.getStateRights();

            stateRights.forEach(stateRight -> {
                List<RightsEnum> currentList = multimapWithListOfRights.get(perimeter.getProcess(), stateRight.getState());

                if (currentList != null) {
                    currentList.add(stateRight.getRight());
                    multimapWithListOfRights.put(perimeter.getProcess(), stateRight.getState(), currentList);
                }
                else
                    multimapWithListOfRights.put(perimeter.getProcess(), stateRight.getState(), new ArrayList<>(Arrays.asList(stateRight.getRight())));
            });
        });

        //Then, for each value in MultiKeyMap, we merge the rights in only one right
        multimapWithListOfRights.forEach((processstate, listRights) -> {
            RightsEnum mergedRight = mergeRights(listRights);
            multimapWithListOfRights.put(processstate.getKey(0), processstate.getKey(1), new ArrayList<>(Arrays.asList(mergedRight)));
        });
        makeComputedPerimeters(multimapWithListOfRights);
    }

    private void makeComputedPerimeters(MultiKeyMap<String, List<RightsEnum>> multimapWithOneRight){
        if (multimapWithOneRight != null) {
            multimapWithOneRight.forEach((processstate, right) -> {
                ComputedPerimeterData c = ComputedPerimeterData.builder()
                                            .process((String)processstate.getKey(0))
                                            .state((String)processstate.getKey(1))
                                            .rights(right.get(0))
                                            .build();
                addComputedPerimeters(c);
            });
        }
    }

    public void addComputedPerimeters(ComputedPerimeter c){
        if(null== computedPerimeters){
            this.computedPerimeters=new HashSet<>();
        }
        computedPerimeters.add(c);
    }

    public RightsEnum mergeRights(List<RightsEnum> rightsList){
        if (rightsList == null || rightsList.isEmpty())
            return null;

        if (rightsList.size() == 1)
            return rightsList.get(0);

        int size = rightsList.size();
        if (rightsList.get(size - 2) == RightsEnum.RECEIVEANDWRITE || rightsList.get(size - 1) == RightsEnum.RECEIVEANDWRITE)
            return RightsEnum.RECEIVEANDWRITE;

        if (rightsList.get(size - 2) == RightsEnum.RECEIVE && rightsList.get(size - 1) == RightsEnum.WRITE)
            return RightsEnum.RECEIVEANDWRITE;

        if (rightsList.get(size - 2) == RightsEnum.WRITE && rightsList.get(size - 1) == RightsEnum.RECEIVE)
            return RightsEnum.RECEIVEANDWRITE;

        if (rightsList.get(size - 2) == rightsList.get(size - 1)) {
            rightsList.remove(size - 1);
            return mergeRights(rightsList);
        }

        return RightsEnum.RECEIVEANDWRITE;
    }
}
