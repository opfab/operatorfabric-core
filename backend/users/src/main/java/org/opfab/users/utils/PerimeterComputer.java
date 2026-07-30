/* Copyright (c) 2018-2026, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */
package org.opfab.users.utils;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Set;

import org.apache.commons.collections4.map.MultiKeyMap;
import org.opfab.common.users.ComputedPerimeter;
import org.opfab.common.users.CurrentUserWithPerimeters;
import org.opfab.users.model.Perimeter;
import org.opfab.common.users.RightEnum;
import org.opfab.users.model.StateRight;

public class PerimeterComputer {

    private CurrentUserWithPerimeters currentUserWithPerimeters;

    public PerimeterComputer(CurrentUserWithPerimeters currentUserWithPerimeters) {
        this.currentUserWithPerimeters = currentUserWithPerimeters;
    }

    public void computePerimeters(Set<Perimeter> perimeters) {
        if (perimeters == null)
            return;

        // First, we build a MultiKeyMap with key is (process, state) and value is a
        // list of rights
        MultiKeyMap<String, List<RightEnum>> multimapOfRights = buildMultiKeyMapOfRights(perimeters);

        // Then, we build a MultiKeyMap with key is (process, state) and value is a list
        // of filteringNotificationAllowed
        MultiKeyMap<String, List<Boolean>> multimapOfFilteringNotificationAllowed = buildMultiKeyMapOfFilteringNotificationAllowed(
                perimeters);

        // Then, for each value in MultiKeyMap, we merge the rights in only one right
        multimapOfRights.forEach((processstate, listRights) -> {
            RightEnum mergedRight = mergeRights(listRights);

            multimapOfRights.put(processstate.getKey(0), processstate.getKey(1),
                    new ArrayList<>(Arrays.asList(mergedRight)));
        });

        // Then, for each value in MultiKeyMap, we merge the
        // filteringNotificationAllowed in only one boolean
        multimapOfFilteringNotificationAllowed.forEach((processstate, listFilteringNotificationAllowed) -> {
            Boolean mergedFilteringNotificationAllowed = mergeFilteringNotificationAllowed(
                    listFilteringNotificationAllowed);

            multimapOfFilteringNotificationAllowed.put(processstate.getKey(0), processstate.getKey(1),
                    new ArrayList<>(Arrays.asList(mergedFilteringNotificationAllowed)));
        });
        makeComputedPerimeters(multimapOfRights, multimapOfFilteringNotificationAllowed);
    }

    private MultiKeyMap<String, List<RightEnum>> buildMultiKeyMapOfRights(Set<Perimeter> perimeters) {
        MultiKeyMap<String, List<RightEnum>> multimapOfRights = new MultiKeyMap<>();

        perimeters.forEach(perimeter -> {

            List<StateRight> stateRights = perimeter.getStateRights();

            stateRights.forEach(stateRight -> {
                List<RightEnum> currentList = multimapOfRights.get(perimeter.getProcess(), stateRight.getState());

                if (currentList != null) {
                    currentList.add(stateRight.getRight());
                    multimapOfRights.put(perimeter.getProcess(), stateRight.getState(), currentList);
                } else
                    multimapOfRights.put(perimeter.getProcess(), stateRight.getState(),
                            new ArrayList<>(Arrays.asList(stateRight.getRight())));
            });
        });

        return multimapOfRights;
    }

    private MultiKeyMap<String, List<Boolean>> buildMultiKeyMapOfFilteringNotificationAllowed(
            Set<Perimeter> perimeters) {
        MultiKeyMap<String, List<Boolean>> multimapOfFilteringNotificationAllowed = new MultiKeyMap<>();

        perimeters.forEach(perimeter -> {

            List<StateRight> stateRights = perimeter.getStateRights();

            stateRights.forEach(stateRight -> {
                List<Boolean> currentList = multimapOfFilteringNotificationAllowed.get(perimeter.getProcess(),
                        stateRight.getState());

                if (currentList != null) {
                    currentList.add(stateRight.getFilteringNotificationAllowed());
                    multimapOfFilteringNotificationAllowed.put(perimeter.getProcess(), stateRight.getState(),
                            currentList);
                } else
                    multimapOfFilteringNotificationAllowed.put(perimeter.getProcess(), stateRight.getState(),
                            new ArrayList<>(Arrays.asList(stateRight.getFilteringNotificationAllowed())));
            });
        });

        return multimapOfFilteringNotificationAllowed;
    }

    private void makeComputedPerimeters(MultiKeyMap<String, List<RightEnum>> multimapWithOneRight,
            MultiKeyMap<String, List<Boolean>> multimapWithOneFilteringNotificationAllowed) {
        if (multimapWithOneRight != null) {
            multimapWithOneRight.forEach((processstate, right) -> {
                ComputedPerimeter c = new ComputedPerimeter();
                c.setProcess(processstate.getKey(0));
                c.setState(processstate.getKey(1));
                c.setRights(right.get(0));
                c.setFilteringNotificationAllowed(multimapWithOneFilteringNotificationAllowed.get(processstate).get(0));
                this.currentUserWithPerimeters.addComputedPerimeters(c);
            });
        }
    }

    public RightEnum mergeRights(List<RightEnum> rightsList) {
        if (rightsList == null || rightsList.isEmpty())
            return null;

        if (rightsList.size() == 1)
            return rightsList.get(0);

        int size = rightsList.size();
        if (rightsList.get(size - 2) == RightEnum.ReceiveAndWrite
                || rightsList.get(size - 1) == RightEnum.ReceiveAndWrite)
            return RightEnum.ReceiveAndWrite;

        if (rightsList.get(size - 2) == rightsList.get(size - 1)) {
            rightsList.remove(size - 1);
            return mergeRights(rightsList);
        }

        return RightEnum.ReceiveAndWrite;
    }

    public Boolean mergeFilteringNotificationAllowed(List<Boolean> listFilteringNotificationAllowed) {
        for (Boolean filteringNotificationAllowed : listFilteringNotificationAllowed) {
            if (filteringNotificationAllowed.equals(Boolean.FALSE))
                return false;
        }
        return Boolean.TRUE;
    }
}
