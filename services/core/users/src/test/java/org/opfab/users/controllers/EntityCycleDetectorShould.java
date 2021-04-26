package org.opfab.users.controllers;

import org.junit.jupiter.api.Test;
import org.opfab.users.model.Entity;
import org.opfab.users.model.EntityData;
import org.opfab.users.utils.EntityCycleDetector;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;

public class EntityCycleDetectorShould {

    /*
    Method naming convention expected to ease comprehension of tests
    It's a mix of Serpent and Camel Case.
    Double '_' to separate "Given statements".

    Begins with expected result:
    - OK -> no cycle detected (hasCycle() return false);
    - CYCLE -> a cycle detected within the entities (hasCycle() return true).

    THe 3rd part describes the Added Entity (which is tested) and it's parent content.

    The 5th part describes the entity collection itself.

    Shorthands used:
     - 4 -> for;
     - 2 -> to.

    All constants and helping methods are declared right after the first method using them and are declared in CamelCase.

     */


    @Test
    void OK__4__AddedEntityWithNoParents__In__AnEmptyEntityCollection() {
        List<EntityData> noEntities = Collections.emptyList();
        Entity withoutAnyParent = EntityData.builder()
                .id(testedEntity)
                .description("this entity has no parents")
                .build();
        EntityCycleDetector underTest = new EntityCycleDetector(withoutAnyParent, noEntities);
        assertThat(underTest.hasCycle()).isFalse();
    }

    private final String testedEntity = "entityFreshlyAdded";

    @Test
    void OK__4__AddedEntityWithUnknownParents__In__AnEmptyEntityCollection(){
        List<EntityData> noEntities = Collections.emptyList();
        Entity withoutAnyParent = EntityData.builder()
                .id(testedEntity)
                .description("this entity has unknown parents")
                .parents(UNKNOWNPARENTS)
                .build();
        EntityCycleDetector underTest = new EntityCycleDetector(withoutAnyParent, noEntities);
        assertThat(underTest.hasCycle()).isFalse();
    }

    private final Set<String> UNKNOWNPARENTS = Stream.of("unknownParent0", "unknownParent1", "unknownParent2").collect(Collectors.toSet());

    @Test
    void CYCLE__4__AddedEntityReferring2Itself__In__AnEmptyEntityCollection() {
        List<EntityData> noEntities = Collections.emptyList();
        String entityId = testedEntity;
        Entity entityWithUnknownParents = EntityData.builder()
                .id(entityId)
                .description("this entity references itself")
                .parents(this.buildSet(entityId))
                .build();
        EntityCycleDetector underTest = new EntityCycleDetector(entityWithUnknownParents, noEntities);
        assertThat(underTest.hasCycle()).isTrue();
    }

    private Set<String> buildSet(String... parents) {
        return Arrays.asList(parents).stream().collect(Collectors.toSet());
    }

    @Test
    void CYCLE__4__AddedEntityWithUnknownParentsAndReferring2ItSelf__In__AnEmptyEntityCollection() {
        List<EntityData> noEntities = Collections.emptyList();
        String entityId = testedEntity;

        Entity withoutAnyParent_And_RefersItself = EntityData.builder()
                .id(entityId)
                .description("this entity has unknown parents AND references itself")
                .parents(this.mixeParentRef(UNKNOWNPARENTS, entityId))
                .build();
        EntityCycleDetector underTest = new EntityCycleDetector(withoutAnyParent_And_RefersItself, noEntities);
        assertThat(underTest.hasCycle()).isTrue();
    }

    private Set<String> mixeParentRef(Set<String> idCollections, String ... ids){
        Set<String> collect = Arrays.stream(ids).collect(Collectors.toSet());
        collect.addAll(UNKNOWNPARENTS);
        return collect;
    }

    private final EntityData entityWithNoParent = EntityData.builder()
            .id("entityWithNoParent")
            .description("first entity").build();

    @Test
    void OK__4__AddedEntityWithNoParent__In__AnEntityCollectionOfOneWithNoParent() {
        List<Entity> entities = Arrays.asList(entityWithNoParent);
        EntityData has_no_parents = EntityData.builder()
                .id(testedEntity)
                .description("has no parents")
                .build();
        EntityCycleDetector underTest = new EntityCycleDetector(has_no_parents, entities);
        assertThat(underTest.hasCycle()).isFalse();
    }

    @Test
    void CYCLE__4__AddedEntityReferencingItSelf__In__AnEntityCollectionOfOneWithNoParent() {
        List<Entity> entities = Arrays.asList(entityWithNoParent);
        EntityData has_no_parents = EntityData.builder()
                .id(testedEntity)
                .description("has no parents")
                .parents(this.buildSet(testedEntity))
                .build();
        EntityCycleDetector underTest = new EntityCycleDetector(has_no_parents, entities);
        assertThat(underTest.hasCycle()).isTrue();
    }

    private final EntityData entityReferencingUnknownParents = EntityData.builder()
            .id("entityReferencingUnknownParent")
            .description("this entity as unknown entity has parents")
            .parents(UNKNOWNPARENTS)
            .build();
    private final EntityData entityReferencingEntityWithNoParents = EntityData.builder()
            .id("entityWithEntityWithNoParentAsParent")
            .description("This entity has a single parent entity, the one with no Parents")
            .parents(this.buildSet(entityWithNoParent))
            .build();

    private Set<String> buildSet(Entity ... entities) {
        return Arrays.stream(entities).map(Entity::getId).collect(Collectors.toSet());
    }

    @Test
    void OK__4__AddedEntityWithNoParent__In__Collection () {
        List<Entity> entities = Arrays.asList(
                entityWithNoParent
                , entityReferencingUnknownParents
                , entityReferencingEntityWithNoParents);
        EntityData has_no_parents = EntityData.builder()
                .id(testedEntity)
                .description("has no parents")
                .build();
        EntityCycleDetector underTest = new EntityCycleDetector(has_no_parents, entities);
        assertThat(underTest.hasCycle()).isFalse();
    }

    @Test
    void OK__4__AddedEntityReferringUnknownParent__In__Collection () {
        List<Entity> entities = Arrays.asList(
                entityWithNoParent
                , entityReferencingUnknownParents
                , entityReferencingEntityWithNoParents);
        EntityData has_no_parents = EntityData.builder()
                .id(testedEntity)
                .description("with unkonwnarents")
                .parents(UNKNOWNPARENTS)
                .build();
        EntityCycleDetector underTest = new EntityCycleDetector(has_no_parents, entities);
        assertThat(underTest.hasCycle()).isFalse();
    }

    @Test
    void OK__4__AddedEntity_ReferringAllOthers__In__Collection(){
        List<Entity> entities = Arrays.asList(entityWithNoParent, entityReferencingUnknownParents, entityReferencingEntityWithNoParents);
        EntityData has_no_parents = EntityData.builder()
                .id(testedEntity)
                .description("with unknonwn parents")
                .parents(this.buildSet(entityWithNoParent, entityReferencingUnknownParents, entityReferencingEntityWithNoParents))
                .build();
        EntityCycleDetector underTest = new EntityCycleDetector(has_no_parents, entities);
        assertThat(underTest.hasCycle()).isFalse();
    }

    @Test
    void CYCLE__4__AddedEntityReferringAllOthersAndItself__In__Collection(){
        List<Entity> entities = Arrays.asList(entityWithNoParent, entityReferencingUnknownParents, entityReferencingEntityWithNoParents);
        EntityData allEntityAndItselfAsParents = EntityData.builder()
                .id(testedEntity)
                .description("with unknonwn parents")
                .parents(this.mixeParentRef(this.buildSet(entityWithNoParent, entityReferencingUnknownParents, entityReferencingEntityWithNoParents),testedEntity))
                .build();
        EntityCycleDetector underTest = new EntityCycleDetector(allEntityAndItselfAsParents, entities);
        assertThat(underTest.hasCycle()).isTrue();
    }

    private final EntityData entityReferencingTheTestedEntity = EntityData.builder()
            .id("entityWithTestedEntityAsParent")
            .description("this entity references the tested entiity as parent")
            .parents(this.buildSet(testedEntity))
            .build();

    @Test
    void OK_4__AddedEntity_ReferringAllOthersButTheOneReferring2Itself__In__CollectionWith1ElementReferring2AddedEntity(){
        List<Entity> entities = Arrays.asList(entityWithNoParent, entityReferencingUnknownParents, entityReferencingEntityWithNoParents,entityReferencingTheTestedEntity);
        EntityData allEntityAndItselfAsParents = EntityData.builder()
                .id(testedEntity)
                .description("with unknonwn parents")
                .parents(this.buildSet(entityWithNoParent, entityReferencingUnknownParents, entityReferencingEntityWithNoParents))
                .build();
        EntityCycleDetector underTest = new EntityCycleDetector(allEntityAndItselfAsParents, entities);
        assertThat(underTest.hasCycle()).isFalse();
    }
    @Test
    void CYCLE_4__AddedEntity_ReferringTheEntityWhichRefersAddedOne__In__CollectionWith1ElementReferring2AddedEntity(){
        Entity[] entities = {entityWithNoParent, entityReferencingUnknownParents, entityReferencingEntityWithNoParents, entityReferencingTheTestedEntity};
        EntityData allEntityAndItselfAsParents = EntityData.builder()
                .id(testedEntity)
                .description("with unknonwn parents")
                .parents(this.buildSet(entityReferencingTheTestedEntity.getId()))
                .build();
        EntityCycleDetector underTest = new EntityCycleDetector(allEntityAndItselfAsParents, Arrays.asList(entities));
        assertThat(underTest.hasCycle()).isTrue();
    }
    @Test
    void CYCLE_4__AddedEntity_ReferringAllOthers__In__CollectionWith1ElementReferring2AddedEntity(){
        Entity[] entities = {entityWithNoParent, entityReferencingUnknownParents, entityReferencingEntityWithNoParents, entityReferencingTheTestedEntity};
        EntityData allEntityAndItselfAsParents = EntityData.builder()
                .id(testedEntity)
                .description("with unknonwn parents")
                .parents(this.buildSet(entities))
                .build();
        EntityCycleDetector underTest = new EntityCycleDetector(allEntityAndItselfAsParents, Arrays.asList(entities));
        assertThat(underTest.hasCycle()).isTrue();
    }

    private final EntityData entityWithEntityReferencingTestedEntityAsParent = EntityData.builder()
            .id("entityReferencingAsParentTheEntityHavingAsParentTheTestedOne")
            .description("this entity references as direct parent the entity having the tested entity as parent")
            .parents(this.buildSet(entityReferencingTheTestedEntity))
            .build();
    @Test
    void OK_4__AddedEntity_ReferringAllOthersButTheOneReferring2Itself_NorTheOneReferringThisLatest__In__CollectionWith1ElementReferring2AddedEntity_And1ReferringThisLatest(){
        List<Entity> entities = Arrays.asList(entityWithNoParent
                , entityReferencingUnknownParents
                , entityReferencingEntityWithNoParents
                , entityReferencingTheTestedEntity
                , entityWithEntityReferencingTestedEntityAsParent);
        EntityData allEntityAndItselfAsParents = EntityData.builder()
                .id(testedEntity)
                .description("with unknonwn parents")
                .parents(this.buildSet(entityWithNoParent, entityReferencingUnknownParents, entityReferencingEntityWithNoParents))
                .build();
        EntityCycleDetector underTest = new EntityCycleDetector(allEntityAndItselfAsParents, entities);
        assertThat(underTest.hasCycle()).isFalse();
    }
    @Test
    void CYCLE_4__AddedEntity_ReferringTheEntityWhichRefersAddedOne__In__CollectionWith1ElementReferring2AddedEntity_And1ReferringThisLatest(){
        Entity[] entities = {entityWithNoParent
                , entityReferencingUnknownParents
                , entityReferencingEntityWithNoParents
                , entityReferencingTheTestedEntity
                , entityWithEntityReferencingTestedEntityAsParent};
        EntityData allEntityAndItselfAsParents = EntityData.builder()
                .id(testedEntity)
                .description("with unknonwn parents")
                .parents(this.buildSet(entityReferencingTheTestedEntity.getId()))
                .build();
        EntityCycleDetector underTest = new EntityCycleDetector(allEntityAndItselfAsParents, Arrays.asList(entities));
        assertThat(underTest.hasCycle()).isTrue();
    }
    @Test
    void CYCLE_4__AddedEntity_ReferringAllOthersButTheOneReferringItself__In__CollectionWith1ElementReferring2AddedEntity(){
        Entity[] entities = {entityWithNoParent
                , entityReferencingUnknownParents
                , entityReferencingEntityWithNoParents
                , entityReferencingTheTestedEntity
                , entityWithEntityReferencingTestedEntityAsParent};
        EntityData allEntityAndItselfAsParents = EntityData.builder()
                .id(testedEntity)
                .description("with unknonwn parents")
                .parents(this.buildSet(entityWithNoParent
                        , entityReferencingUnknownParents
                        , entityReferencingEntityWithNoParents
                        , entityWithEntityReferencingTestedEntityAsParent))
                .build();
        EntityCycleDetector underTest = new EntityCycleDetector(allEntityAndItselfAsParents, Arrays.asList(entities));
        assertThat(underTest.hasCycle()).isTrue();
    }
    @Test
    void CYCLE_4__AddedEntity_ReferringAllOthers__In__CollectionWith1ElementReferring2AddedEntity_And1ReferringThisLatest(){
        Entity[] entities = {entityWithNoParent
                , entityReferencingUnknownParents
                , entityReferencingEntityWithNoParents
                , entityReferencingTheTestedEntity
                , entityWithEntityReferencingTestedEntityAsParent};
        EntityData allEntityAndItselfAsParents = EntityData.builder()
                .id(testedEntity)
                .description("with unknonwn parents")
                .parents(this.buildSet(entities))
                .build();
        EntityCycleDetector underTest = new EntityCycleDetector(allEntityAndItselfAsParents, Arrays.asList(entities));
        assertThat(underTest.hasCycle()).isTrue();
    }
}
