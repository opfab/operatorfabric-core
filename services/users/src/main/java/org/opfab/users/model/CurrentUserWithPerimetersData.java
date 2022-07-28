/* Copyright (c) 2018-2022, RTE (http://www.rte-france.com)
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
    public void setComputedPerimeters(List<ComputedPerimeter> computedPerimeters) {
        this.computedPerimeters = new HashSet<>(computedPerimeters);
    }

    @Override
    public List<ComputedPerimeter> getComputedPerimeters() {
        if(computedPerimeters == null)
            return Collections.emptyList();
        return new ArrayList<>(computedPerimeters);
    }

    public void computePerimeters(Set<Perimeter> perimeters){
        if (perimeters == null)
            return;

        //First, we build a MultiKeyMap with key is (process, state) and value is a list of rights
        MultiKeyMap<String, List<RightsEnum>> multimapOfRights = buildMultiKeyMapOfRights(perimeters);

        //Then, we build a MultiKeyMap with key is (process, state) and value is a list of filteringNotificationAllowed
        MultiKeyMap<String, List<Boolean>> multimapOfFilteringNotificationAllowed = buildMultiKeyMapOfFilteringNotificationAllowed(perimeters);

        //Then, for each value in MultiKeyMap, we merge the rights in only one right
        multimapOfRights.forEach((processstate, listRights) -> {
            RightsEnum mergedRight = mergeRights(listRights);

            multimapOfRights.put(processstate.getKey(0), processstate.getKey(1), new ArrayList<>(Arrays.asList(mergedRight)));
        });

        //Then, for each value in MultiKeyMap, we merge the filteringNotificationAllowed in only one boolean
        multimapOfFilteringNotificationAllowed.forEach((processstate, listFilteringNotificationAllowed) -> {
            Boolean mergedFilteringNotificationAllowed = mergeFilteringNotificationAllowed(listFilteringNotificationAllowed);

            multimapOfFilteringNotificationAllowed.put(processstate.getKey(0), processstate.getKey(1),
                                                       new ArrayList<>(Arrays.asList(mergedFilteringNotificationAllowed)));
        });
        makeComputedPerimeters(multimapOfRights, multimapOfFilteringNotificationAllowed);
    }

    private MultiKeyMap<String, List<RightsEnum>> buildMultiKeyMapOfRights(Set<Perimeter> perimeters) {
        MultiKeyMap<String, List<RightsEnum>> multimapOfRights = new MultiKeyMap<>();

        perimeters.forEach(perimeter -> {

            List<StateRight> stateRights = perimeter.getStateRights();

            stateRights.forEach(stateRight -> {
                List<RightsEnum> currentList = multimapOfRights.get(perimeter.getProcess(), stateRight.getState());

                if (currentList != null) {
                    currentList.add(stateRight.getRight());
                    multimapOfRights.put(perimeter.getProcess(), stateRight.getState(), currentList);
                }
                else
                    multimapOfRights.put(perimeter.getProcess(), stateRight.getState(), new ArrayList<>(Arrays.asList(stateRight.getRight())));
            });
        });

        return multimapOfRights;
    }

    private MultiKeyMap<String, List<Boolean>> buildMultiKeyMapOfFilteringNotificationAllowed(Set<Perimeter> perimeters) {
        MultiKeyMap<String, List<Boolean>> multimapOfFilteringNotificationAllowed = new MultiKeyMap<>();

        perimeters.forEach(perimeter -> {

            List<StateRight> stateRights = perimeter.getStateRights();

            stateRights.forEach(stateRight -> {
                List<Boolean> currentList = multimapOfFilteringNotificationAllowed.get(perimeter.getProcess(), stateRight.getState());

                if (currentList != null) {
                    currentList.add(stateRight.getFilteringNotificationAllowed());
                    multimapOfFilteringNotificationAllowed.put(perimeter.getProcess(), stateRight.getState(), currentList);
                }
                else
                    multimapOfFilteringNotificationAllowed.put(perimeter.getProcess(), stateRight.getState(),
                            new ArrayList<>(Arrays.asList(stateRight.getFilteringNotificationAllowed())));
            });
        });

        return multimapOfFilteringNotificationAllowed;
    }

    private void makeComputedPerimeters(MultiKeyMap<String, List<RightsEnum>> multimapWithOneRight,
                                        MultiKeyMap<String, List<Boolean>> multimapWithOneFilteringNotificationAllowed){
        if (multimapWithOneRight != null) {
            multimapWithOneRight.forEach((processstate, right) -> {
                ComputedPerimeterData c = ComputedPerimeterData.builder()
                                            .process(processstate.getKey(0))
                                            .state(processstate.getKey(1))
                                            .rights(right.get(0))
                                            .filteringNotificationAllowed(multimapWithOneFilteringNotificationAllowed.get(processstate).get(0))
                                            .build();
                addComputedPerimeters(c);
            });
        }
    }

    public void addComputedPerimeters(ComputedPerimeter c){
        if(null == computedPerimeters){
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

    public Boolean mergeFilteringNotificationAllowed(List<Boolean> listFilteringNotificationAllowed) {
        for (Boolean filteringNotificationAllowed : listFilteringNotificationAllowed) {
            if (filteringNotificationAllowed == Boolean.FALSE)
                return false;
        }
        return Boolean.TRUE;
    }
}
