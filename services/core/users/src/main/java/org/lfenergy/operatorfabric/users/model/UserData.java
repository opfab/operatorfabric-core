/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.lfenergy.operatorfabric.users.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Please use Builder to instantiate
 */
@Document(collection = "user")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserData implements User {

    @Id
    private String login;
    private String firstName;
    private String lastName;
    @Singular("group")
    private Set<String> groupSet;

    public UserData(SimpleUser simpleUser){
        this();
        this.login = simpleUser.getLogin();
        this.firstName = simpleUser.getFirstName();
        this.lastName = simpleUser.getLastName();
    }

    public void addGroup(String group){
        groupSet.add(group);
    }

    @Override
    public List<String> getGroups() {
        if(groupSet == null)
            return null;
        return new ArrayList<>(groupSet);
    }

    @Override
    public void setGroups(List<String> groups) {
        groupSet = new HashSet<>(groups);
    }

    public void deleteGroup(String name) {
        groupSet.remove(name);
    }
}
