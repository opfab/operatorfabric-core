/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.users.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.*;

/**
 * !! Please use Builder to instantiate !!
 *
 * User Model, documented at {@link User}
 *
 * {@inheritDoc}
 *
 * @author David Binder
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

    public Set<String> getGroupSet(){
        if(this.groupSet ==null)
            return Collections.emptySet();
        return groupSet;
    }

    @Override
    public List<String> getGroups() {
        if(groupSet == null)
            return Collections.emptyList();
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
