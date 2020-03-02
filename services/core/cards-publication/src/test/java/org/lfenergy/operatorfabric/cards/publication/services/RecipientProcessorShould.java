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
    public static void init(){
        processor = new RecipientProcessor();
    }


    @Test
    public void processGroup(){
        ComputedRecipient result = processor.processAll(matchGroup("group1"));
        assertThat(result).isNotNull();
        assertThat(result.getMain()).isNull();
        assertThat(result.getUsers()).isEmpty();
        assertThat(result.getGroups()).containsExactly("group1");
        assertThat(result.getOrphanUsers()).isEmpty();
    }


    @Test
    public void processUnionGroups(){
        ComputedRecipient result = processor.processAll(union(matchGroup("group1"),matchGroup("group2")));
        assertThat(result).isNotNull();
        assertThat(result.getMain()).isNull();
        assertThat(result.getUsers()).isEmpty();
        assertThat(result.getGroups()).containsExactlyInAnyOrder("group1","group2");
        assertThat(result.getOrphanUsers()).isEmpty();
    }

    @Test
    public void processUser(){
        ComputedRecipient result = processor.processAll(matchUser("user1"));
        assertThat(result).isNotNull();
        assertThat(result.getUsers()).containsExactly("user1");
        assertThat(result.getGroups()).isEmpty();
        assertThat(result.getOrphanUsers()).containsExactly("user1");
    }

    @Test
    public void processUnionUsers(){
        ComputedRecipient result = processor.processAll(union(matchUser("user1"),matchUser("user2")));
        assertThat(result).isNotNull();
        assertThat(result.getMain()).isNull();
        assertThat(result.getGroups()).isEmpty();
        assertThat(result.getUsers()).containsExactlyInAnyOrder("user1","user2");
        assertThat(result.getOrphanUsers()).containsExactlyInAnyOrder("user1","user2");
    }

    @Test
    public void processUnionGroupsAndUser(){
        ComputedRecipient result = processor.processAll(union(matchGroup("group1"),matchGroup("group2"),matchGroup("group3"),matchUser("user1")));
        assertThat(result).isNotNull();
        assertThat(result.getMain()).isNull();
        assertThat(result.getUsers()).containsExactly("user1");
        assertThat(result.getGroups()).containsExactlyInAnyOrder("group1","group2","group3");
        assertThat(result.getOrphanUsers()).containsExactly("user1");
    }


}
