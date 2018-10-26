package org.lfenergy.operatorfabric.cards.publication.services;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.lfenergy.operatorfabric.cards.model.Recipient;
import org.lfenergy.operatorfabric.cards.model.RecipientEnum;
import org.lfenergy.operatorfabric.cards.publication.model.RecipientPublicationData;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;

/**
 * <p></p>
 * Created on 26/10/18
 *
 * @author davibind
 */
public class RecipientProcessorShould {

    private static Map<String,List<String>> cache = new HashMap<>();
    private static RecipientProcessor processor;

    @BeforeAll
    public static void initCache(){
        List<String> group1Users = new ArrayList<>();
        group1Users.add("user1");
        group1Users.add("user2");
        cache.put("group1",group1Users);
        List<String> group2Users = new ArrayList<>();
        group2Users.add("user1");
        group2Users.add("user3");
        cache.put("group2",group1Users);
        processor = new RecipientProcessor();
        processor.setUserCache(cache);
    }

    @Test
    public void processAll(){


        Recipient intersect = RecipientPublicationData.builder()
           .type(RecipientEnum.INTERSECT)
           .recipient(
              RecipientPublicationData.builder()
                 .type(RecipientEnum.GROUP)
                 .identity("group1")
              .build()
           )
           .recipient(
              RecipientPublicationData.builder()
                 .type(RecipientEnum.GROUP)
                 .identity("group2")
                 .build()
           )
           .build();
        ComputedRecipient result = processor.processAll(intersect);
        assertThat(result).isNotNull();
        assertThat(result.getMain()).isNull();
    }

}