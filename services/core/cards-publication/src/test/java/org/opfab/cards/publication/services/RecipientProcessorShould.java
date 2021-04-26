/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.opfab.cards.publication.services;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.opfab.cards.publication.model.RecipientPublicationData;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

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
        ComputedRecipient result = processor.processAll(RecipientPublicationData.matchGroup("group1"));
        assertThat(result).isNotNull();
        assertThat(result.getUsers()).isEmpty();
        assertThat(result.getGroups()).containsExactly("group1");
        assertThat(result.getOrphanUsers()).isEmpty();
    }


    @Test
    public void processUnionGroups(){
        ComputedRecipient result = processor.processAll(RecipientPublicationData.union(RecipientPublicationData.matchGroup("group1"), RecipientPublicationData.matchGroup("group2")));
        assertThat(result).isNotNull();
        assertThat(result.getUsers()).isEmpty();
        assertThat(result.getGroups()).containsExactlyInAnyOrder("group1","group2");
        assertThat(result.getOrphanUsers()).isEmpty();
    }

    @Test
    public void processUser(){
        ComputedRecipient result = processor.processAll(RecipientPublicationData.matchUser("user1"));
        assertThat(result).isNotNull();
        assertThat(result.getUsers()).containsExactly("user1");
        assertThat(result.getGroups()).isEmpty();
        assertThat(result.getOrphanUsers()).containsExactly("user1");
    }

    @Test
    public void processUnionUsers(){
        ComputedRecipient result = processor.processAll(RecipientPublicationData.union(RecipientPublicationData.matchUser("user1"), RecipientPublicationData.matchUser("user2")));
        assertThat(result).isNotNull();
        assertThat(result.getGroups()).isEmpty();
        assertThat(result.getUsers()).containsExactlyInAnyOrder("user1","user2");
        assertThat(result.getOrphanUsers()).containsExactlyInAnyOrder("user1","user2");
    }

    @Test
    public void processUnionGroupsAndUser(){
        ComputedRecipient result = processor.processAll(RecipientPublicationData.union(RecipientPublicationData.matchGroup("group1"), RecipientPublicationData.matchGroup("group2"), RecipientPublicationData.matchGroup("group3"), RecipientPublicationData.matchUser("user1")));
        assertThat(result).isNotNull();
        assertThat(result.getUsers()).containsExactly("user1");
        assertThat(result.getGroups()).containsExactlyInAnyOrder("group1","group2","group3");
        assertThat(result.getOrphanUsers()).containsExactly("user1");
    }


}
