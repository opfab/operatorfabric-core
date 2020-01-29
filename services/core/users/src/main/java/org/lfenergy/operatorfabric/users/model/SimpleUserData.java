/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


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
