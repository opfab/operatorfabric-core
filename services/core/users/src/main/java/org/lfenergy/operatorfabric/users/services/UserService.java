/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.users.services;

import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.springtools.error.model.ApiError;
import org.lfenergy.operatorfabric.springtools.error.model.ApiErrorException;
import org.lfenergy.operatorfabric.users.model.GroupData;
import org.lfenergy.operatorfabric.users.model.Perimeter;
import org.lfenergy.operatorfabric.users.model.PerimeterData;
import org.lfenergy.operatorfabric.users.model.StateRight;
import org.lfenergy.operatorfabric.users.repositories.GroupRepository;
import org.lfenergy.operatorfabric.users.repositories.PerimeterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@Slf4j
public class UserService {

    public static final String GROUP_ID_IMPOSSIBLE_TO_FETCH_MSG = "Group id impossible to fetch : %s";
    public static final String PERIMETER_ID_IMPOSSIBLE_TO_FETCH_MSG = "Perimeter id impossible to fetch : %s";

    @Autowired
    private GroupRepository groupRepository;
    @Autowired
    private PerimeterRepository perimeterRepository;

    /** Retrieve groups from repository for groups list, throwing an error if a group id is not found
     * */
    public List<GroupData> retrieveGroups(List<String> groupIds) {
        List<GroupData> foundGroups = new ArrayList<>();
        for(String id : groupIds){
            GroupData foundGroup = groupRepository.findById(id).orElseThrow(
                    () -> new ApiErrorException(
                            ApiError.builder()
                                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                                    .message(String.format(GROUP_ID_IMPOSSIBLE_TO_FETCH_MSG, id))
                                    .build()
                    ));
            foundGroups.add(foundGroup);
        }
        return foundGroups;
    }

    /** Retrieve perimeters from repository for perimeter list, throwing an error if a perimeter is not found
     * */
    public List<PerimeterData> retrievePerimeters(List<String> perimeterIds) {
        List<PerimeterData> foundPerimeters = new ArrayList<>();
        for(String perimeterId : perimeterIds){
            PerimeterData foundPerimeter = perimeterRepository.findById(perimeterId).orElseThrow(
                    () -> new ApiErrorException(
                            ApiError.builder()
                                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                                    .message(String.format(PERIMETER_ID_IMPOSSIBLE_TO_FETCH_MSG, perimeterId))
                                    .build()
                    ));
            foundPerimeters.add(foundPerimeter);
        }
        return foundPerimeters;
    }

    public boolean isEachStateUniqueInPerimeter(Perimeter perimeter){

        if ((perimeter != null) && (perimeter.getStateRights().size() > 1)) {

            Set<String> mySet = new HashSet<>();
            for (StateRight stateRight : perimeter.getStateRights()) {

                String state = stateRight.getState();
                if (! mySet.contains(state))
                    mySet.add(state);
                else
                    return false;
            }
        }
        return true;
    }
}

