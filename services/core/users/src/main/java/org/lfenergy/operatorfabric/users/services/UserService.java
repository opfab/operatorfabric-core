package org.lfenergy.operatorfabric.users.services;

import org.lfenergy.operatorfabric.users.model.GroupData;
import org.lfenergy.operatorfabric.users.model.PerimeterData;
import org.lfenergy.operatorfabric.users.model.User;

import java.util.List;

public interface UserService {
    User createUser(User user) ;
    List<GroupData> retrieveGroups(List<String> groupIds);
    List<PerimeterData> retrievePerimeters(List<String> perimeterIds);
}
