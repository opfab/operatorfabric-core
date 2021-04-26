package org.opfab.users.services;

import org.opfab.users.model.GroupData;
import org.opfab.users.model.PerimeterData;
import org.opfab.users.model.User;

import java.util.List;

public interface UserService {
    User createUser(User user) ;
    List<GroupData> retrieveGroups(List<String> groupIds);
    List<PerimeterData> retrievePerimeters(List<String> perimeterIds);
}
