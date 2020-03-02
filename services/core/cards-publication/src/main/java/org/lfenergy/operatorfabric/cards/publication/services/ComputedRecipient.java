/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


package org.lfenergy.operatorfabric.cards.publication.services;

import lombok.*;
import lombok.experimental.Accessors;

import java.util.Set;

/**
 * Recipient computation result data
 */
@Data
@AllArgsConstructor
@Builder
public class ComputedRecipient {
    @Singular
    private Set<String> groups;
    @Singular
    private Set<String> users;
    @Singular
    private Set<String> orphanUsers;

    /**
     * Used to bypass javadoc inability to handle annotation processor generated classes
     * @return an encapsulated builder
     */
    public static BuilderEncapsulator encapsulatedBuilder(){
        return new BuilderEncapsulator(builder());
    }

    /**
     * Class used to encapsulate builder in order to bypass javadoc inability to handle annotation processor generated classes
     */
    @AllArgsConstructor
    public static class BuilderEncapsulator{
        @Accessors(fluent = true) @Getter
        ComputedRecipientBuilder builder;
    }

}
