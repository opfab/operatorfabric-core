/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


package org.lfenergy.operatorfabric.users.model;

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
            List<RightsEnum> currentList = multimapWithListOfRights.get(perimeter.getProcess(), perimeter.getState());

            if (currentList != null) {
                currentList.add(perimeter.getRights());
                multimapWithListOfRights.put(perimeter.getProcess(), perimeter.getState(), currentList);
            }
            else
                multimapWithListOfRights.put(perimeter.getProcess(), perimeter.getState(), new ArrayList<>(Arrays.asList(perimeter.getRights())));
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
        if (rightsList.get(size - 2) == RightsEnum.ALL || rightsList.get(size - 1) == RightsEnum.ALL)
            return RightsEnum.ALL;

        if ((rightsList.get(size - 2) == rightsList.get(size - 1)) || (rightsList.get(size - 1) == RightsEnum.READ)) {
            rightsList.remove(size - 1);
            return mergeRights(rightsList);
        }

        if (rightsList.get(size - 2) == RightsEnum.READ) {
            rightsList.remove(size - 2);
            return mergeRights(rightsList);
        }

        return RightsEnum.ALL;
    }
}