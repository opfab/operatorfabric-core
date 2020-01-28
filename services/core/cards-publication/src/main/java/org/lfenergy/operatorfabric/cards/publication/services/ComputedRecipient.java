
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
    private String main;
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
