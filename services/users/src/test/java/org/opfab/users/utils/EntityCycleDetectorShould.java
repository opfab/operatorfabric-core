/* Copyright (c) 2021-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.users.utils;

import org.junit.jupiter.api.Test;
import org.opfab.users.model.Entity;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;

class EntityCycleDetectorShould {

        /*
         * Method naming convention expected to ease comprehension of tests
         * It's a mix of Serpent and Camel Case.
         * Double '_' to separate "Given statements".
         * 
         * Begins with expected result:
         * - OK : no cycle detected (hasCycle method return false);
         * - CYCLE : a cycle detected within the entities (hasCycle method return true).
         * 
         * THe 3rd part describes the Added Entity (which is tested) and it's parent
         * content.
         * 
         * The 5th part describes the entity collection itself.
         * 
         * Shorthands used:
         * - 4 = for
         * - 2 = to
         * 
         * All constants and helping methods are declared right after the first method
         * using them and are declared in CamelCase.
         * 
         */

        @Test
        void OK__4__AddedEntityWithNoParents__In__AnEmptyEntityCollection() {
                List<Entity> noEntities = Collections.emptyList();
                Entity withoutAnyParent = new Entity();
                withoutAnyParent.setId(testedEntity);
                withoutAnyParent.setDescription("this entity has no parents");
                EntityCycleDetector underTest = new EntityCycleDetector(withoutAnyParent, noEntities);
                assertThat(underTest.hasCycle()).isFalse();
        }

        private final String testedEntity = "entityFreshlyAdded";

        @Test
        void OK__4__AddedEntityWithUnknownParents__In__AnEmptyEntityCollection() {
                List<Entity> noEntities = Collections.emptyList();
                Entity withoutAnyParent = new Entity();
                withoutAnyParent.setId(testedEntity);
                withoutAnyParent.setDescription("this entity has unknown parents");
                withoutAnyParent.setParents(UNKNOWNPARENTS);
                EntityCycleDetector underTest = new EntityCycleDetector(withoutAnyParent, noEntities);
                assertThat(underTest.hasCycle()).isFalse();
        }

        private final List<String> UNKNOWNPARENTS = Stream.of("unknownParent0", "unknownParent1", "unknownParent2")
                        .collect(Collectors.toList());

        @Test
        void CYCLE__4__AddedEntityReferring2Itself__In__AnEmptyEntityCollection() {
                List<Entity> noEntities = Collections.emptyList();
                String entityId = testedEntity;
                Entity entityWithUnknownParents = new Entity();
                entityWithUnknownParents.setId(entityId);
                entityWithUnknownParents.setDescription("this entity references itself");
                entityWithUnknownParents.setParents(this.buildList(entityId));
                EntityCycleDetector underTest = new EntityCycleDetector(entityWithUnknownParents, noEntities);
                assertThat(underTest.hasCycle()).isTrue();
        }

        private List<String> buildList(String... parents) {
                return Arrays.asList(parents).stream().collect(Collectors.toList());
        }

        @Test
        void CYCLE__4__AddedEntityWithUnknownParentsAndReferring2ItSelf__In__AnEmptyEntityCollection() {
                List<Entity> noEntities = Collections.emptyList();
                String entityId = testedEntity;

                Entity withoutAnyParentAndRefersItself = new Entity();
                withoutAnyParentAndRefersItself.setId(entityId);
                withoutAnyParentAndRefersItself
                                .setDescription("this entity has unknown parents AND references itself");
                withoutAnyParentAndRefersItself.setParents(this.mixeParentRef(UNKNOWNPARENTS, entityId));
                EntityCycleDetector underTest = new EntityCycleDetector(withoutAnyParentAndRefersItself, noEntities);
                assertThat(underTest.hasCycle()).isTrue();
        }

        private List<String> mixeParentRef(List<String> idCollections, String... ids) {
                List<String> collect = Arrays.stream(ids).collect(Collectors.toList());
                collect.addAll(UNKNOWNPARENTS);
                return collect;
        }

        private final Entity entityWithNoParent = new Entity();
        {
                entityWithNoParent.setId("entityWithNoParent");
                entityWithNoParent.setDescription("first entity");
        }

        @Test
        void OK__4__AddedEntityWithNoParent__In__AnEntityCollectionOfOneWithNoParent() {
                List<Entity> entities = Arrays.asList(entityWithNoParent);
                Entity hasNoParents = new Entity();
                hasNoParents.setId(testedEntity);
                hasNoParents.setDescription("has no parents");
                EntityCycleDetector underTest = new EntityCycleDetector(hasNoParents, entities);
                assertThat(underTest.hasCycle()).isFalse();
        }

        @Test
        void CYCLE__4__AddedEntityReferencingItSelf__In__AnEntityCollectionOfOneWithNoParent() {
                List<Entity> entities = Arrays.asList(entityWithNoParent);
                Entity hasNoParents = new Entity();
                hasNoParents.setId(testedEntity);
                hasNoParents.setDescription("has no parents");
                hasNoParents.setParents(this.buildList(testedEntity));
                EntityCycleDetector underTest = new EntityCycleDetector(hasNoParents, entities);
                assertThat(underTest.hasCycle()).isTrue();
        }

        private final Entity entityReferencingUnknownParents = new Entity();
        {

                entityReferencingUnknownParents.setId("entityReferencingUnknownParent");
                entityReferencingUnknownParents.setDescription("this entity as unknown entity has parents");
                entityReferencingUnknownParents.setParents(UNKNOWNPARENTS);
        }

        private final Entity entityReferencingEntityWithNoParents = new Entity();
        {

                entityReferencingEntityWithNoParents.setId("entityReferencingEntityWithNoParents");
                entityReferencingEntityWithNoParents
                                .setDescription("this entity has a single parent entity, the one with no Parents");
                entityReferencingEntityWithNoParents.setParents(this.buildList(entityWithNoParent));
        }

        private List<String> buildList(Entity... entities) {
                return Arrays.stream(entities).map(Entity::getId).collect(Collectors.toList());
        }

        @Test
        void OK__4__AddedEntityWithNoParent__In__Collection() {
                List<Entity> entities = Arrays.asList(
                                entityWithNoParent, entityReferencingUnknownParents,
                                entityReferencingEntityWithNoParents);
                Entity hasNoParents = new Entity();
                hasNoParents.setId(testedEntity);
                hasNoParents.setDescription("has no parents");
                EntityCycleDetector underTest = new EntityCycleDetector(hasNoParents, entities);
                assertThat(underTest.hasCycle()).isFalse();
        }

        @Test
        void OK__4__AddedEntityReferringUnknownParent__In__Collection() {
                List<Entity> entities = Arrays.asList(
                                entityWithNoParent, entityReferencingUnknownParents,
                                entityReferencingEntityWithNoParents);
                Entity hasNoParents = new Entity();
                hasNoParents.setId(testedEntity);
                hasNoParents.setDescription("with unknown parents");
                hasNoParents.setParents(UNKNOWNPARENTS);
                EntityCycleDetector underTest = new EntityCycleDetector(hasNoParents, entities);
                assertThat(underTest.hasCycle()).isFalse();
        }

        @Test
        void OK__4__AddedEntity_ReferringAllOthers__In__Collection() {
                List<Entity> entities = Arrays.asList(entityWithNoParent, entityReferencingUnknownParents,
                                entityReferencingEntityWithNoParents);
                Entity hasNoParents = new Entity();
                hasNoParents.setId(testedEntity);
                hasNoParents.setDescription("with unknown parents");
                hasNoParents.setParents(this.buildList(entityWithNoParent, entityReferencingUnknownParents,
                                entityReferencingEntityWithNoParents));
                EntityCycleDetector underTest = new EntityCycleDetector(hasNoParents, entities);
                assertThat(underTest.hasCycle()).isFalse();
        }

        @Test
        void CYCLE__4__AddedEntityReferringAllOthersAndItself__In__Collection() {
                List<Entity> entities = Arrays.asList(entityWithNoParent, entityReferencingUnknownParents,
                                entityReferencingEntityWithNoParents);
                Entity allEntityAndItselfAsParents = new Entity();
                allEntityAndItselfAsParents.setId(testedEntity);
                allEntityAndItselfAsParents.setDescription("with unknown parents");
                allEntityAndItselfAsParents.setParents(this.mixeParentRef(this.buildList(entityWithNoParent,
                                entityReferencingUnknownParents, entityReferencingEntityWithNoParents), testedEntity));
                EntityCycleDetector underTest = new EntityCycleDetector(allEntityAndItselfAsParents, entities);
                assertThat(underTest.hasCycle()).isTrue();
        }

        private final Entity entityReferencingTheTestedEntity = new Entity();
        {

                entityReferencingTheTestedEntity.setId("entityWithTestedEntityAsParent");
                entityReferencingTheTestedEntity.setDescription("this entity references the tested entity as parent");
                entityReferencingTheTestedEntity.setParents(this.buildList(testedEntity));
        }

        @Test
        void OK_4__AddedEntity_ReferringAllOthersButTheOneReferring2Itself__In__CollectionWith1ElementReferring2AddedEntity() {
                List<Entity> entities = Arrays.asList(entityWithNoParent, entityReferencingUnknownParents,
                                entityReferencingEntityWithNoParents, entityReferencingTheTestedEntity);
                Entity allEntityAndItselfAsParents = new Entity();
                allEntityAndItselfAsParents.setId(testedEntity);
                allEntityAndItselfAsParents.setDescription("with unknown parents");
                allEntityAndItselfAsParents.setParents(this.buildList(entityWithNoParent,
                                entityReferencingUnknownParents, entityReferencingEntityWithNoParents));
                EntityCycleDetector underTest = new EntityCycleDetector(allEntityAndItselfAsParents, entities);
                assertThat(underTest.hasCycle()).isFalse();
        }

        @Test
        void CYCLE_4__AddedEntity_ReferringTheEntityWhichRefersAddedOne__In__CollectionWith1ElementReferring2AddedEntity() {
                Entity[] entities = { entityWithNoParent, entityReferencingUnknownParents,
                                entityReferencingEntityWithNoParents, entityReferencingTheTestedEntity };
                Entity allEntityAndItselfAsParents = new Entity();
                allEntityAndItselfAsParents.setId(testedEntity);
                allEntityAndItselfAsParents.setDescription("with unknown parents");
                allEntityAndItselfAsParents.setParents(this.buildList(entityReferencingTheTestedEntity.getId()));
                EntityCycleDetector underTest = new EntityCycleDetector(allEntityAndItselfAsParents,
                                Arrays.asList(entities));
                assertThat(underTest.hasCycle()).isTrue();
        }

        @Test
        void CYCLE_4__AddedEntity_ReferringAllOthers__In__CollectionWith1ElementReferring2AddedEntity() {
                Entity[] entities = { entityWithNoParent, entityReferencingUnknownParents,
                                entityReferencingEntityWithNoParents, entityReferencingTheTestedEntity };
                Entity allEntityAndItselfAsParents = new Entity();
                allEntityAndItselfAsParents.setId(testedEntity);
                allEntityAndItselfAsParents.setDescription("with unknown parents");
                allEntityAndItselfAsParents.setParents(this.buildList(entities));
                EntityCycleDetector underTest = new EntityCycleDetector(allEntityAndItselfAsParents,
                                Arrays.asList(entities));
                assertThat(underTest.hasCycle()).isTrue();
        }

        private final Entity entityWithEntityReferencingTestedEntityAsParent = new Entity();
        {

                entityWithEntityReferencingTestedEntityAsParent
                                .setId("entityReferencingAsParentTheEntityHavingAsParentTheTestedOne");
                entityWithEntityReferencingTestedEntityAsParent.setDescription(
                                "this entity references as direct parent the entity having the tested entity as parent");
                entityWithEntityReferencingTestedEntityAsParent
                                .setParents(this.buildList(entityReferencingTheTestedEntity));
        }

        @Test
        void OK_4__AddedEntity_ReferringAllOthersButTheOneReferring2Itself_NorTheOneReferringThisLatest__In__CollectionWith1ElementReferring2AddedEntity_And1ReferringThisLatest() {
                List<Entity> entities = Arrays.asList(entityWithNoParent, entityReferencingUnknownParents,
                                entityReferencingEntityWithNoParents, entityReferencingTheTestedEntity,
                                entityWithEntityReferencingTestedEntityAsParent);
                Entity allEntityAndItselfAsParents = new Entity();
                allEntityAndItselfAsParents.setId(testedEntity);
                allEntityAndItselfAsParents.setDescription("with unknown parents");
                allEntityAndItselfAsParents.setParents(this.buildList(entityWithNoParent,
                                entityReferencingUnknownParents, entityReferencingEntityWithNoParents));
                EntityCycleDetector underTest = new EntityCycleDetector(allEntityAndItselfAsParents, entities);
                assertThat(underTest.hasCycle()).isFalse();
        }

        @Test
        void CYCLE_4__AddedEntity_ReferringTheEntityWhichRefersAddedOne__In__CollectionWith1ElementReferring2AddedEntity_And1ReferringThisLatest() {
                Entity[] entities = { entityWithNoParent, entityReferencingUnknownParents,
                                entityReferencingEntityWithNoParents, entityReferencingTheTestedEntity,
                                entityWithEntityReferencingTestedEntityAsParent };
                Entity allEntityAndItselfAsParents = new Entity();
                allEntityAndItselfAsParents.setId(testedEntity);
                allEntityAndItselfAsParents.setDescription("with unknown parents");
                allEntityAndItselfAsParents.setParents(this.buildList(entityReferencingTheTestedEntity.getId()));
                EntityCycleDetector underTest = new EntityCycleDetector(allEntityAndItselfAsParents,
                                Arrays.asList(entities));
                assertThat(underTest.hasCycle()).isTrue();
        }

        @Test
        void CYCLE_4__AddedEntity_ReferringAllOthersButTheOneReferringItself__In__CollectionWith1ElementReferring2AddedEntity() {
                Entity[] entities = { entityWithNoParent, entityReferencingUnknownParents,
                                entityReferencingEntityWithNoParents, entityReferencingTheTestedEntity,
                                entityWithEntityReferencingTestedEntityAsParent };
                Entity allEntityAndItselfAsParents = new Entity();
                allEntityAndItselfAsParents.setId(testedEntity);
                allEntityAndItselfAsParents.setDescription("with unknown parents");
                allEntityAndItselfAsParents.setParents(this.buildList(entityWithNoParent,
                                entityReferencingUnknownParents, entityReferencingEntityWithNoParents,
                                entityWithEntityReferencingTestedEntityAsParent));
                EntityCycleDetector underTest = new EntityCycleDetector(allEntityAndItselfAsParents,
                                Arrays.asList(entities));
                assertThat(underTest.hasCycle()).isTrue();
        }

        @Test
        void CYCLE_4__AddedEntity_ReferringAllOthers__In__CollectionWith1ElementReferring2AddedEntity_And1ReferringThisLatest() {
                Entity[] entities = { entityWithNoParent, entityReferencingUnknownParents,
                                entityReferencingEntityWithNoParents, entityReferencingTheTestedEntity,
                                entityWithEntityReferencingTestedEntityAsParent };
                Entity allEntityAndItselfAsParents = new Entity();
                allEntityAndItselfAsParents.setId(testedEntity);
                allEntityAndItselfAsParents.setDescription("with unknown parents");
                allEntityAndItselfAsParents.setParents(this.buildList(entities));
                EntityCycleDetector underTest = new EntityCycleDetector(allEntityAndItselfAsParents,
                                Arrays.asList(entities));
                assertThat(underTest.hasCycle()).isTrue();
        }
}
