
package org.lfenergy.operatorfabric.users.controllers;

import org.lfenergy.operatorfabric.springtools.configuration.oauth.UpdatedUserEvent;
import org.lfenergy.operatorfabric.springtools.error.model.ApiError;
import org.lfenergy.operatorfabric.springtools.error.model.ApiErrorException;
import org.lfenergy.operatorfabric.users.model.Group;
import org.lfenergy.operatorfabric.users.model.GroupData;
import org.lfenergy.operatorfabric.users.model.UserData;
import org.lfenergy.operatorfabric.users.repositories.GroupRepository;
import org.lfenergy.operatorfabric.users.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.bus.ServiceMatcher;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.ArrayList;
import java.util.List;


/**
 * GroupsController, documented at {@link GroupsApi}
 *
 * @author David Binder
 */
@RestController
@RequestMapping("/groups")
public class GroupsController implements GroupsApi {

    public static final String GROUP_NOT_FOUND_MSG = "Group %s not found";
    public static final String USER_NOT_FOUND_MSG = "User %s not found";
    public static final String BAD_USER_LIST_MSG = "Bad user list : user %s not found";
    public static final String NO_MATCHING_GROUP_NAME_MSG = "Payload Group name does not match URL Group name";
    @Autowired
    private GroupRepository groupRepository;
    @Autowired
    private UserRepository userRepository;

    /* These are Spring Cloud Bus beans used to fire an event (UpdatedUserEvent) every time a user is modified.
    *  Other services handle this event by clearing their user cache for the given user. See issue #64*/
    @Autowired
    private ServiceMatcher busServiceMatcher;
    @Autowired
    private ApplicationEventPublisher publisher;

    @Override
    public Void addGroupUsers(HttpServletRequest request, HttpServletResponse response, String name, List<String> users) throws Exception {

        //Only existing groups can be updated
        findGroupOrThrow(name);

        //Retrieve users from repository for users list, throwing an error if a login is not found
        List<UserData> foundUsers = retrieveUsers(users);

        for (UserData userData : foundUsers) {
            userData.addGroup(name);
            publisher.publishEvent(new UpdatedUserEvent(this, busServiceMatcher.getServiceId(), userData.getLogin()));
        }
        userRepository.saveAll(foundUsers);
        return null;

    }

    @Override
    public Group createGroup(HttpServletRequest request, HttpServletResponse response, Group group) throws Exception {
        if(groupRepository.findById(group.getName()).orElse(null) == null){
            response.addHeader("Location", request.getContextPath() + "/groups/" + group.getName());
            response.setStatus(201);
        }
        return groupRepository.save((GroupData)group);
    }

    @Override
    public Void deleteGroupUsers(HttpServletRequest request, HttpServletResponse response, String name) throws Exception {

        //Only existing groups can be updated
         findGroupOrThrow(name);

        //Retrieve users from repository for users list, throwing an error if a login is not found
        List<UserData> foundUsers = userRepository.findByGroupSetContaining(name);

        if(foundUsers!=null) {
            for (UserData userData : foundUsers) {
                userData.deleteGroup(name);
                publisher.publishEvent(new UpdatedUserEvent(this, busServiceMatcher.getServiceId(), userData.getLogin()));
            }
            userRepository.saveAll(foundUsers);
        }
        return null;
    }

    @Override
    public Void deleteGroupUser(HttpServletRequest request, HttpServletResponse response, String name, String login) throws Exception {

        //Only existing groups can be updated
        findGroupOrThrow(name);

        //Retrieve users from repository for users list, throwing an error if a login is not found
        UserData foundUser = userRepository.findById(login).orElseThrow(()->new ApiErrorException(
                ApiError.builder()
                        .status(HttpStatus.NOT_FOUND)
                        .message(String.format(USER_NOT_FOUND_MSG,login))
                        .build()
        ));

        if(foundUser!=null) {
                foundUser.deleteGroup(name);
                publisher.publishEvent(new UpdatedUserEvent(this, busServiceMatcher.getServiceId(), foundUser.getLogin()));
            userRepository.save(foundUser);
        }
        return null;
    }

    @Override
    public List<? extends Group> fetchGroups(HttpServletRequest request, HttpServletResponse response) throws Exception {
        return groupRepository.findAll();
    }

    @Override
    public Group fetchGroup(HttpServletRequest request, HttpServletResponse response, String name) throws Exception {
        return groupRepository.findById(name).orElseThrow(
           ()-> new ApiErrorException(
              ApiError.builder()
                 .status(HttpStatus.NOT_FOUND)
                 .message(String.format(GROUP_NOT_FOUND_MSG,name))
                 .build()
           )
        );
    }

    @Override
    public Group updateGroup(HttpServletRequest request, HttpServletResponse response, String name, Group group) throws Exception {
        //name from group body parameter should match name path parameter
        if(!group.getName().equals(name)){
            throw new ApiErrorException(
                    ApiError.builder()
                            .status(HttpStatus.BAD_REQUEST)
                            .message(NO_MATCHING_GROUP_NAME_MSG)
                            .build());
        } else {
            return createGroup(request,response,group);
        }

    }

    @Override
    public Void updateGroupUsers(HttpServletRequest request, HttpServletResponse response, String name, List<String> users) throws Exception {

        //Only existing groups can be updated
        findGroupOrThrow(name);

        List<UserData> formerlyBelongs = userRepository.findByGroupSetContaining(name);
        List<String> newUsersInGroup = new ArrayList<>(users);

        //Make sure the intended updated users list only contains logins existing in the repository, throwing an error if this is not the case
        retrieveUsers(users);

        List<UserData> toUpdate = new ArrayList<>();
        formerlyBelongs.stream()
           .filter(u->!users.contains(u.getLogin()))
           .forEach(u-> {
               u.deleteGroup(name);
               newUsersInGroup.remove(u.getLogin());
               toUpdate.add(u);
           });

        //Fire an UpdatedUserEvent for all users that are updated because they're removed from the group
        for (UserData userData : toUpdate) {
            userData.addGroup(name);
            publisher.publishEvent(new UpdatedUserEvent(this,busServiceMatcher.getServiceId(),userData.getLogin()));
        }
        userRepository.saveAll(toUpdate);
        addGroupUsers(request, response, name,newUsersInGroup); //For users that are added to the group, the event will be published by addGroupUsers.
        return null;
    }

    private GroupData findGroupOrThrow(String name) {
        return groupRepository.findById(name).orElseThrow(
                ()-> new ApiErrorException(
                        ApiError.builder()
                                .status(HttpStatus.NOT_FOUND)
                                .message(String.format(GROUP_NOT_FOUND_MSG,name))
                                .build()
                ));
    }

/** Retrieve users from repository for logins list, throwing an error if a login is not found
 * */
    private List<UserData> retrieveUsers(List<String> logins) {

        List<UserData> foundUsers = new ArrayList<>();
        for(String login : logins){
            UserData foundUser = userRepository.findById(login).orElseThrow(
                    () -> new ApiErrorException(
                            ApiError.builder()
                                    .status(HttpStatus.BAD_REQUEST)
                                    .message(String.format(BAD_USER_LIST_MSG,login))
                                    .build()
                    ));
            foundUsers.add(foundUser);
        }

        return foundUsers;
    }
}
