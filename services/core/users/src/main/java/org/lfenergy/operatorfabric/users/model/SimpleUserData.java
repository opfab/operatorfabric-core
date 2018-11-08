package org.lfenergy.operatorfabric.users.model;

import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Simple User Model, documented at {@link SimpleUser}
 *
 * {@inheritDoc}
 *
 * @author David Binder
 */
@Data
@NoArgsConstructor
public class SimpleUserData implements SimpleUser {

    private String login;
    private String firstName;
    private String lastName;

}
