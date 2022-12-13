package org.opfab.users.services;

import org.opfab.users.model.*;
import org.opfab.users.repositories.EntityRepository;
import org.opfab.users.model.CurrentUserWithPerimetersData;
import org.opfab.users.model.EntityData;
import org.opfab.users.model.GroupData;
import org.opfab.users.model.PerimeterData;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

public class CurrentUserWithPerimetersService {

    private UserService userService;
    private EntityRepository entityRepository;

    public CurrentUserWithPerimetersService(UserService userService,EntityRepository entityRepository) {
        this.userService = userService;
        this.entityRepository = entityRepository;
    }

    public CurrentUserWithPerimeters fetchCurrentUserWithPerimeters(User user) throws Exception {
        CurrentUserWithPerimetersData currentUserWithPerimetersData = new CurrentUserWithPerimetersData();
        if (user != null) {
            currentUserWithPerimetersData.setUserData(user);
            handleGroups(user, currentUserWithPerimetersData);
            handleEntities(user);
        }
        return currentUserWithPerimetersData;
    }

    protected void handleGroups(User userData, CurrentUserWithPerimetersData userWithPerimeterData) {
        List<String> groups = userData.getGroups(); //First, we recover the groups to which the user belongs

        //We recover the user_settings to have the process/state filters defined by the user, for his feed
        userWithPerimeterData.setProcessesStatesNotNotified(
                userService.retrieveUserSettings(userData.getLogin()).getProcessesStatesNotNotified());

        if ((groups != null) && (!groups.isEmpty())) {     //Then, we recover the groups data
            List<GroupData> groupsData = userService.retrieveGroups(groups);

            if ((groupsData != null) && (!groupsData.isEmpty())) {
                Set<Perimeter> perimetersData = new HashSet<>(); //We use a set because we don't want to have a duplicate
                groupsData.forEach(     //For each group, we recover its perimeters
                        groupData -> {
                            List<PerimeterData> list = userService.retrievePerimeters(groupData.getPerimeters());
                            if (list != null)
                                perimetersData.addAll(list);
                        });
                userWithPerimeterData.computePerimeters(perimetersData);
            }
        }
    }
/*
    by convention there can not be cycles within Entity relationship
    this function adds transitive entity references to the declared user entity list
 */
    protected void handleEntities(User userData) {
        List<String> userEntityList = userData.getEntities();

        // we retrieve entitiesDisconnected of the user
        List<String> entitiesDisconnected = userService.retrieveUserSettings(userData.getLogin()).getEntitiesDisconnected();

        // we remove entitiesDisconnected from the entities list of the user
        if (entitiesDisconnected != null) {
            userEntityList = userEntityList.stream().filter(
                    entityId -> !entitiesDisconnected.contains(entityId)).collect(Collectors.toList());
        }

        Set<String> userEntityNames = userEntityList.stream().collect(Collectors.toSet());
        List<EntityData> systemEntities = entityRepository.findAll();
        Map<String, EntityData> systemEntityDictionary = systemEntities.stream()
                .collect(Collectors.toMap(Entity::getId, Function.identity()));
        userEntityList.stream().forEach(entityName -> this.manageParentsRef(entityName, systemEntityDictionary, userEntityNames));
        userData.setEntities(userEntityNames.stream().collect(Collectors.toList()));
    }
// recursive because by convention there are no cycle in entity relationship (cf above)
    protected void manageParentsRef(String entity, Map<String, EntityData> dictionary, Set<String> records) {
        EntityData entityRef = dictionary.get(entity);
        if (entityRef != null) {
            entityRef.getParents().stream().forEach(parentName -> {
                if (!records.contains(parentName)) {
                    this.manageParentsRef(parentName, dictionary, records);
                    records.add(parentName);
                }
            });
        }
    } 
}
