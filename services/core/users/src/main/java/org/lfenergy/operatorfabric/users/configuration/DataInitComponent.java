
package org.lfenergy.operatorfabric.users.configuration;

import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.users.configuration.users.UsersProperties;
import org.lfenergy.operatorfabric.users.model.GroupData;
import org.lfenergy.operatorfabric.users.model.UserData;
import org.lfenergy.operatorfabric.users.model.UserSettingsData;
import org.lfenergy.operatorfabric.users.repositories.GroupRepository;
import org.lfenergy.operatorfabric.users.repositories.UserRepository;
import org.lfenergy.operatorfabric.users.repositories.UserSettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.util.Optional;

/**
 * This component solely serve as data intializer for users and groups, it loads users and group from properties
 * configuration and insert or update them as needed
 *
 * @author David Binder
 */
@Component
@Slf4j
public class DataInitComponent {

    private static final String FAILED_INIT_MSG = "Unable to init ";
    @Autowired
    private UsersProperties usersProperties;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private UserSettingsRepository userSettingsRepository;

    @Getter
    private boolean initiated;

    @PostConstruct
    public void init() {
        try {
            for (GroupData g : usersProperties.getGroups()) {
                safeInsertGroup(g);
            }
            for (UserData u : usersProperties.getUsers()) {
                safeInsertUsers(u);
            }

            for (UserSettingsData us : usersProperties.getUserSettings())
                safeInsertUserSettings(us);
        }finally {
            initiated=true;
        }
    }

    /**
     * Insert user settings, if failure (seetings already exist), logs and carries on to next user settings
     *
     * If users exist adds missing groups (no delete)
     *
     * @param u
     */
    private void safeInsertUserSettings(UserSettingsData u) {
        try {
            userSettingsRepository.insert(u);
        } catch (DuplicateKeyException ex) {
            log.warn(FAILED_INIT_MSG + u.getLogin() + " user settings: duplicate");
        }
    }

    /**
     * Insert users, if failure (users already exist), logs and carries on to next users
     *
     * If users exist adds missing groups (no delete)
     *
     * @param u
     */
    private void safeInsertUsers(UserData u) {
        try {
            userRepository.insert(u);
        } catch (DuplicateKeyException ex) {
            log.warn(FAILED_INIT_MSG + u.getLogin() + " user: duplicate");
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

    /**
     * Insert groups, if failure (groups already exist), logs and carries on to next group
     *
     * @param g
     */
    private void safeInsertGroup(GroupData g) {
        try {
            groupRepository.insert(g);
        } catch (DuplicateKeyException ex) {
            log.warn(FAILED_INIT_MSG + g.getName() + " group: duplicate");
        }
    }
}
