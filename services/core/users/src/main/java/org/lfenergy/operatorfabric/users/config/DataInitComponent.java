package org.lfenergy.operatorfabric.users.config;

import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.users.config.users.UsersProperties;
import org.lfenergy.operatorfabric.users.model.GroupData;
import org.lfenergy.operatorfabric.users.model.UserData;
import org.lfenergy.operatorfabric.users.repositories.GroupRepository;
import org.lfenergy.operatorfabric.users.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.util.Optional;

/**
 * <p></p>
 * Created on 16/10/18
 *
 * @author davibind
 */
@Component
@Slf4j
public class DataInitComponent {

    @Autowired
    private UsersProperties usersProperties;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GroupRepository groupRepository;

    @Getter
    private boolean initiated;

    @PostConstruct
    public void init() {
        try {
            for (GroupData g : usersProperties.getGroups()) {
                try {
                    groupRepository.insert(g);
                } catch (DuplicateKeyException ex) {
                    log.warn("unnable to init " + g.getName() + " group: duplicate");
                }
            }
            for (UserData u : usersProperties.getUsers()) {
                try {
                    userRepository.insert(u);
                } catch (DuplicateKeyException ex) {
                    log.warn("unnable to init " + u.getLogin() + " user: duplicate");
                    Optional<UserData> resultUser = userRepository.findById(u.getLogin());
                    if (resultUser.isPresent()) {
                        UserData loadedUser = resultUser.get();
                        boolean updated = false;
                        for (String groupName : u.getGroupSet()) {
                            if (!loadedUser.getGroupSet().contains(groupName)) {
                                loadedUser.addGroup(groupName);
                                log.info("Added \"" + groupName + "\" to existing user \"" + loadedUser.getLogin() + "\"");

                                updated = true;
                            }
                        }
                        if (updated)
                            userRepository.save(loadedUser);
                    }
                }
            }
        }finally {
            initiated=true;
        }
    }
}
