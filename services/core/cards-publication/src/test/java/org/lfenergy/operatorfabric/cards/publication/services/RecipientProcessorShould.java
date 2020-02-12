/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


package org.lfenergy.operatorfabric.cards.publication.services;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.lfenergy.operatorfabric.cards.publication.model.RecipientPublicationData.*;

/**
 * <p></p>
 * Created on 26/10/18
 *
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
        cache.put("group2",group2Users);
        processor = new RecipientProcessor();
        processor.setUserCache(cache);
    }

    @Test
    public void processIntersect(){
        ComputedRecipient result = processor.processAll(intersect(matchGroup("group1"),matchGroup("group2")));
        assertThat(result).isNotNull();
        assertThat(result.getMain()).isNull();
        assertThat(result.getGroups()).containsExactlyInAnyOrder("group1","group2");
        assertThat(result.getUsers()).containsExactlyInAnyOrder("user1");
        assertThat(result.getOrphanUsers()).isEmpty();
    }

//    @Test
//    public void processEmpty(){
//        ComputedRecipient result = processor.processAll(RecipientPublicationData.builder().build());
//        assertThat(result).isNotNull();
//        assertThat(result.getMain()).isNull();
//        assertThat(result.getGroups()).isEmpty();
//        assertThat(result.getUsers()).isEmpty();
//        assertThat(result.getOrphanUsers()).isEmpty();
//    }

    @Test
    public void processUnion(){
        ComputedRecipient result = processor.processAll(union(matchGroup("group1"),matchUser("user3")));
        assertThat(result).isNotNull();
        assertThat(result.getMain()).isNull();
        assertThat(result.getGroups()).containsExactlyInAnyOrder("group1");
        assertThat(result.getUsers()).containsExactlyInAnyOrder("user1","user2","user3");
        assertThat(result.getOrphanUsers()).containsExactly("user3");
    }

    @Test
    public void processRandom(){
        ComputedRecipient result = processor.processAll(random(union(matchGroup("group1"),matchGroup("group2"))));
        assertThat(result).isNotNull();
        assertThat(result.getMain()).isIn("user1","user2","user3");
        assertThat(result.getGroups()).containsExactlyInAnyOrder("group1","group2");
        assertThat(result.getUsers()).containsExactlyInAnyOrder("user1","user2","user3");
        assertThat(result.getOrphanUsers()).isEmpty();
    }

    @Test
    public void processWeighted(){
        ComputedRecipient result = processor.processAll(weigthed(union(matchGroup("group1"),matchGroup("group2")),"user1"));
        assertThat(result).isNotNull();
        assertThat(result.getMain()).isIn("user1","user2","user3");
        assertThat(result.getGroups()).containsExactlyInAnyOrder("group1","group2");
        assertThat(result.getUsers()).containsExactlyInAnyOrder("user1","user2","user3");
        assertThat(result.getOrphanUsers()).isEmpty();
    }

    @Test
    public void processFavorite(){
        ComputedRecipient result = processor.processAll(favorite(union(matchGroup("group1"),matchGroup("group2")),
           "user1"));
        assertThat(result).isNotNull();
        assertThat(result.getMain()).isEqualTo("user1");
        assertThat(result.getGroups()).containsExactlyInAnyOrder("group1","group2");
        assertThat(result.getUsers()).containsExactlyInAnyOrder("user1","user2","user3");
        assertThat(result.getOrphanUsers()).isEmpty();
    }

    @Test
    public void processWeightedNotFound(){
        ComputedRecipient result = processor.processAll(weigthed(union(matchGroup("group1"),matchGroup("group2")),
           "user33"));
        assertThat(result).isNotNull();
        assertThat(result.getMain()).isIn("user1","user2","user3");
        assertThat(result.getGroups()).containsExactlyInAnyOrder("group1","group2");
        assertThat(result.getUsers()).containsExactlyInAnyOrder("user1","user2","user3");
        assertThat(result.getOrphanUsers()).isEmpty();
    }

    @Test
    public void processFavoriteNotFound(){
        ComputedRecipient result = processor.processAll(favorite(union(matchGroup("group1"),matchGroup("group2")),
           "user33"));
        assertThat(result).isNotNull();
        assertThat(result.getMain()).isIn("user1","user2","user3");
        assertThat(result.getGroups()).containsExactlyInAnyOrder("group1","group2");
        assertThat(result.getUsers()).containsExactlyInAnyOrder("user1","user2","user3");
        assertThat(result.getOrphanUsers()).isEmpty();
    }

    @Test
    public void processUnionPreserveMain(){
        ComputedRecipient result = processor.processAll(union(true,favorite(matchGroup("group1"),"user1"),matchGroup
           ("group2")));
        assertThat(result).isNotNull();
        assertThat(result.getMain()).isEqualTo("user1");
        assertThat(result.getGroups()).containsExactlyInAnyOrder("group1","group2");
        assertThat(result.getUsers()).containsExactlyInAnyOrder("user1","user2","user3");
        assertThat(result.getOrphanUsers()).isEmpty();
    }

    @Test
    public void processIntersectPreserveMain(){
        ComputedRecipient result = processor.processAll(intersect(true,favorite(matchGroup("group1"),"user1"),matchGroup
           ("group2")));
        assertThat(result).isNotNull();
        assertThat(result.getMain()).isEqualTo("user1");
        assertThat(result.getGroups()).containsExactlyInAnyOrder("group1","group2");
        assertThat(result.getUsers()).containsExactlyInAnyOrder("user1");
        assertThat(result.getOrphanUsers()).isEmpty();
    }

    @Test
    public void processIntersectPreserveMainMissed(){
        ComputedRecipient result = processor.processAll(intersect(true,favorite(matchGroup("group1"),"user2"),matchGroup
           ("group2")));
        assertThat(result).isNotNull();
        assertThat(result.getMain()).isNull();
        assertThat(result.getGroups()).containsExactlyInAnyOrder("group1","group2");
        assertThat(result.getUsers()).containsExactlyInAnyOrder("user1");
        assertThat(result.getOrphanUsers()).isEmpty();
    }
}
