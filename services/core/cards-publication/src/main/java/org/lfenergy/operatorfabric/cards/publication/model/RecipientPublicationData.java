package org.lfenergy.operatorfabric.cards.publication.model;

import lombok.*;
import org.lfenergy.operatorfabric.cards.model.RecipientEnum;

import javax.validation.constraints.NotNull;
import java.util.List;

/**
 * <p>Please use builder to instantiate</p>
 *
 * <p>Recipient Model, documented at {@link Recipient}</p>
 *
 * {@inheritDoc}
 *
 * @author David Binder
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RecipientPublicationData implements Recipient {
    @NotNull
    private RecipientEnum type;
    private String identity;
    @Singular
    private List<? extends Recipient> recipients;
    private Boolean preserveMain;

    public static RecipientPublicationData intersect(Recipient... recipients) {
        RecipientPublicationData.RecipientPublicationDataBuilder result = RecipientPublicationData.builder()
           .type(RecipientEnum.INTERSECT);
        for(Recipient r : recipients)
            result.recipient(r);
        return result.build();
    }

    public static RecipientPublicationData intersect(boolean preserveMain, Recipient... recipients) {
        RecipientPublicationData.RecipientPublicationDataBuilder result = RecipientPublicationData.builder()
           .type(RecipientEnum.INTERSECT)
           .preserveMain(preserveMain);
        for(Recipient r : recipients)
            result.recipient(r);
        return result.build();
    }

    public static RecipientPublicationData union(Recipient... recipients) {
        RecipientPublicationData.RecipientPublicationDataBuilder result = RecipientPublicationData.builder()
           .type(RecipientEnum.UNION);
        for(Recipient r : recipients)
            result.recipient(r);
        return result.build();
    }

    public static RecipientPublicationData union(boolean preserveMain, Recipient... recipients) {
        RecipientPublicationData.RecipientPublicationDataBuilder result = RecipientPublicationData.builder()
           .type(RecipientEnum.UNION)
           .preserveMain(preserveMain);
        for(Recipient r : recipients)
            result.recipient(r);
        return result.build();
    }

    public static RecipientPublicationData random(Recipient recipient) {
        return RecipientPublicationData.builder()
           .type(RecipientEnum.RANDOM)
           .recipient(recipient)
           .build();
    }

    public static RecipientPublicationData weigthed(Recipient recipient, String identity) {
        return RecipientPublicationData.builder()
           .type(RecipientEnum.WEIGHTED)
           .recipient(recipient)
           .identity(identity)
           .build();
    }

    public static RecipientPublicationData favorite(Recipient recipient, String identity) {
        return RecipientPublicationData.builder()
           .type(RecipientEnum.FAVORITE)
           .recipient(recipient)
           .identity(identity)
           .build();
    }

    public static RecipientPublicationData matchGroup(String group) {
        return RecipientPublicationData.builder()
           .type(RecipientEnum.GROUP)
           .identity(group)
           .build();
    }

    public static RecipientPublicationData matchUser(String user) {
        return RecipientPublicationData.builder()
           .type(RecipientEnum.USER)
           .identity(user)
           .build();
    }
}
