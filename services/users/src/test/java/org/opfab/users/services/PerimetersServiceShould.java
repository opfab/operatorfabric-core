/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.users.services;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.opfab.users.model.EntityCreationReport;
import org.opfab.users.model.Group;
import org.opfab.users.model.GroupData;
import org.opfab.users.model.OperationResult;
import org.opfab.users.model.Perimeter;
import org.opfab.users.model.PerimeterData;
import org.opfab.users.model.RightsEnum;
import org.opfab.users.model.StateRight;
import org.opfab.users.model.StateRightData;
import org.opfab.users.stubs.GroupRepositoryStub;
import org.opfab.users.stubs.PerimeterRepositoryStub;
import org.opfab.users.stubs.UserServiceStub;

@DisplayName("PerimetersService")
public class PerimetersServiceShould {

    private PerimetersService perimetersService;
    private PerimeterRepositoryStub perimeterRepositoryStub = new PerimeterRepositoryStub();
    private GroupRepositoryStub groupRepositoryStub = new GroupRepositoryStub();
    private UserServiceStub userServiceStub = new UserServiceStub();

    @BeforeEach
    void clear() {
        initPerimeterRepository();
        initGroupRepository();
    }

    private void initPerimeterRepository() {
        perimeterRepositoryStub.deleteAll();

        PerimeterData perimeter1 = new PerimeterData();
        perimeter1.setId("perimeter1");
        perimeter1.setProcess("processTest");
        StateRight stateRight = new StateRightData();
        stateRight.setState("state1");
        stateRight.setRight(RightsEnum.RECEIVE);
        List<StateRight> stateRights = new ArrayList<>();
        stateRights.add(stateRight);
        perimeter1.setStateRights(stateRights);

        PerimeterData perimeter2 = new PerimeterData();
        perimeter2.setId("perimeter2");
        perimeter2.setProcess("processTest");
        perimeterRepositoryStub.insert(perimeter1);
        perimeterRepositoryStub.insert(perimeter2);
        perimetersService = new PerimetersService(perimeterRepositoryStub, groupRepositoryStub, userServiceStub);
    }

    private void initGroupRepository() {
        GroupData g1, g2, g3;
        g1 = GroupData.builder()
                .id("group1")
                .name("Group 1")
                .description("Group 1 description")
                .build();
        List<String> p1 = new ArrayList<>(Arrays.asList("perimeter1", "perimeter2"));
        g1.setPerimeters(p1);
        g2 = GroupData.builder()
                .id("group2")
                .name("Group 2")
                .description("Group 2 description")
                .build();
        List<String> p2 = new ArrayList<>(Arrays.asList("perimeter1"));
        g2.setPerimeters(p2);
        g3 = GroupData.builder()
                .id("group3")
                .name("Group 3")
                .description("Group 3 description")
                .build();
        List<String> p3 = new ArrayList<>(Arrays.asList("perimeter2"));
        g3.setPerimeters(p3);
        groupRepositoryStub.insert(g1);
        groupRepositoryStub.insert(g2);
        groupRepositoryStub.insert(g3);
    }

    @Nested
    @DisplayName("Fetch")
    class Fetch {
        @Test
        void GIVEN_Perimeters_In_Repository_WHEN_Fetch_Perimeters_THEN_Return_All_Perimeters() {
            List<Perimeter> perimeters = perimetersService.fetchPerimeters();
            assertThat(perimeters).hasSize(2);
        }

        @Test
        void GIVEN_Not_Existing_Perimeter_In_Repository_WHEN_Fetch_Perimeter_THEN_Return_NOT_FOUND() {
            OperationResult<Perimeter> perimeter = perimetersService.fetchPerimeter("dummy");
            assertThat(perimeter.isSuccess()).isFalse();
            assertThat(perimeter.getErrorType()).isEqualTo(OperationResult.ErrorType.NOT_FOUND);
        }

        @Test
        void GIVEN_Existing_Perimeter_In_Repository_WHEN_Fetch_Perimeter_THEN_Success_And_Return_Perimeter() {
            OperationResult<Perimeter> perimeter = perimetersService.fetchPerimeter("perimeter1");
            assertThat(perimeter.isSuccess()).isTrue();
            assertThat(perimeter.getResult().getId()).isEqualTo("perimeter1");
            assertThat(perimeter.getResult().getProcess()).isEqualTo("processTest");
        }
    }

    @Nested
    @DisplayName("Create")
    class Create {
        @Test
        void GIVEN_An_Invalid_PerimeterId__WHEN_Creating_Perimeter_THEN_Return_Bad_Request() {
            PerimeterData perimeter = new PerimeterData("invalid?id", "invalid id", null);
            OperationResult<EntityCreationReport<Perimeter>> result = perimetersService.createPerimeter(perimeter);
            assertThat(result.isSuccess()).isFalse();
            assertThat(result.getErrorType()).isEqualTo(OperationResult.ErrorType.BAD_REQUEST);
        }

        @Test
        void GIVEN_A_Valid_Perimeter_WHEN_Create_An_Already_Existing_Perimeter_THEN_Return_Bad_Request() {
            PerimeterData perimeter = new PerimeterData("perimeter1", "processId", null);
            OperationResult<EntityCreationReport<Perimeter>> result = perimetersService.createPerimeter(perimeter);
            assertThat(result.isSuccess()).isFalse();
            assertThat(result.getErrorType()).isEqualTo(OperationResult.ErrorType.BAD_REQUEST);
        }

        @Test
        void GIVEN_A_Valid_Perimeter_WHEN_Create_Perimeter_With_One_State_THEN_Return_Created_Perimeter() {
            Perimeter perimeter = PerimeterData.builder().id("newPerimeter").process("processId")
                    .stateRights(new HashSet<>(Arrays.asList(new StateRightData("state1", RightsEnum.RECEIVE, true))))
                    .build();
            OperationResult<EntityCreationReport<Perimeter>> result = perimetersService.createPerimeter(perimeter);
            assertThat(result.isSuccess()).isTrue();
            assertThat(result.getResult().getEntity().getId()).isEqualTo("newPerimeter");
            assertThat(result.getResult().getEntity().getProcess()).isEqualTo("processId");
            assertThat(perimeterRepositoryStub.findById("newPerimeter").get().getProcess()).isEqualTo("processId");
        }

        @Test
        void GIVEN_A_Valid_Perimeter_WHEN_Create_Perimeter_With_Two_States_THEN_Return_Created_Perimeter() {

            Perimeter perimeter = PerimeterData.builder().id("newPerimeter").process("processId")
                    .stateRights(
                            new HashSet<>(Arrays.asList(new StateRightData("state1", RightsEnum.RECEIVEANDWRITE, true),
                                    new StateRightData("state2", RightsEnum.WRITE, true))))
                    .build();

            OperationResult<EntityCreationReport<Perimeter>> result = perimetersService.createPerimeter(perimeter);
            assertThat(result.isSuccess()).isTrue();
            assertThat(result.getResult().getEntity().getId()).isEqualTo("newPerimeter");
            assertThat(result.getResult().getEntity().getProcess()).isEqualTo("processId");
            assertThat(perimeterRepositoryStub.findById("newPerimeter").get().getProcess()).isEqualTo("processId");
        }

        @Test
        void GIVEN_A_Perimeter_With_2_States_And_Duplicate_State_WHEN_Create_Perimeter_THEN_Return_BAD_REQUEST() {

            Perimeter perimeter = PerimeterData.builder().id("INVALID").process("process2")
                    .stateRights(new HashSet<>(Arrays.asList(new StateRightData("state1", RightsEnum.WRITE, true),
                            new StateRightData("state1", RightsEnum.RECEIVEANDWRITE, true))))
                    .build();

            OperationResult<EntityCreationReport<Perimeter>> result = perimetersService.createPerimeter(perimeter);
            assertThat(result.isSuccess()).isFalse();
            assertThat(result.getErrorType()).isEqualTo(OperationResult.ErrorType.BAD_REQUEST);
        }
    }

    @Nested
    @DisplayName("Update")
    class Update {
        @Test
        void GIVEN_An_Invalid_PerimeterId__WHEN_Updating_Perimeter_THEN_Return_Bad_Request() {
            PerimeterData perimeter = new PerimeterData("invalid?id", "invalid id", null);
            OperationResult<EntityCreationReport<Perimeter>> result = perimetersService.updatePerimeter(perimeter);
            assertThat(result.isSuccess()).isFalse();
            assertThat(result.getErrorType()).isEqualTo(OperationResult.ErrorType.BAD_REQUEST);
        }

        @Test
        void GIVEN_A_Valid_Perimeter_WHEN_Update_An_Existing_Perimeter_THEN_Return_Success_And_Perimeter_Updated() {
            PerimeterData perimeter = new PerimeterData("perimeter1", "process2", null);
            OperationResult<EntityCreationReport<Perimeter>> result = perimetersService.updatePerimeter(perimeter);
            assertThat(result.isSuccess()).isTrue();
            assertThat(result.getResult().isUpdate()).isTrue();
            assertThat(result.getResult().getEntity().getProcess()).isEqualTo("process2");
            assertThat(perimeterRepositoryStub.findById("perimeter1").get().getProcess()).isEqualTo("process2");
        }

        @Test
        void GIVEN_A_Valid_Perimeter_WHEN_Update_None_Exiting_Perimeter_With_One_State_THEN_Success_And_Perimeter_Is_Created() {
            Perimeter perimeter = PerimeterData.builder().id("newPerimeter").process("processId")
                    .stateRights(new HashSet<>(Arrays.asList(new StateRightData("state1", RightsEnum.RECEIVE, true))))
                    .build();
            OperationResult<EntityCreationReport<Perimeter>> result = perimetersService.updatePerimeter(perimeter);
            assertThat(result.isSuccess()).isTrue();
            assertThat(result.getResult().getEntity().getId()).isEqualTo("newPerimeter");
            assertThat(result.getResult().getEntity().getProcess()).isEqualTo("processId");
            assertThat(perimeterRepositoryStub.findById("newPerimeter").get().getProcess()).isEqualTo("processId");
        }

        @Test
        void GIVEN_A_Valid_Perimeter_WHEN_Update_None_Existing_Perimeter_With_Two_States_THEN_Success_And_Perimeter_Is_Created() {

            Perimeter perimeter = PerimeterData.builder().id("newPerimeter").process("processId")
                    .stateRights(
                            new HashSet<>(Arrays.asList(new StateRightData("state1", RightsEnum.RECEIVEANDWRITE, true),
                                    new StateRightData("state2", RightsEnum.WRITE, true))))
                    .build();

            OperationResult<EntityCreationReport<Perimeter>> result = perimetersService.updatePerimeter(perimeter);
            assertThat(result.isSuccess()).isTrue();
            assertThat(result.getResult().getEntity().getId()).isEqualTo("newPerimeter");
            assertThat(result.getResult().getEntity().getProcess()).isEqualTo("processId");
            assertThat(perimeterRepositoryStub.findById("newPerimeter").get().getProcess()).isEqualTo("processId");
        }

        @Test
        void GIVEN_A_Perimeter_With_2_States_And_Duplicate_State_WHEN_Update_Perimeter_THEN_Return_BAD_REQUEST_And_Perimter_Is_Not_Updated() {

            Perimeter perimeter = PerimeterData.builder().id("perimeter1").process("newProcess")
                    .stateRights(new HashSet<>(Arrays.asList(new StateRightData("state1", RightsEnum.WRITE, true),
                            new StateRightData("state1", RightsEnum.RECEIVEANDWRITE, true))))
                    .build();

            OperationResult<EntityCreationReport<Perimeter>> result = perimetersService.createPerimeter(perimeter);
            assertThat(result.isSuccess()).isFalse();
            assertThat(result.getErrorType()).isEqualTo(OperationResult.ErrorType.BAD_REQUEST);
            assertThat(perimeterRepositoryStub.findById("perimeter1").get().getProcess()).isEqualTo("processTest");
        }

    }

    @Nested
    @DisplayName("Delete")
    class Delete {
        @Test
        void GIVEN_Perimeter_Does_Not_Exist_WHEN_Deleting_Perimeter_THEN_Return_NotFound() {
            OperationResult<String> result = perimetersService.deletePerimeter("dummyPerimeter");
            assertThat(result.isSuccess()).isFalse();
            assertThat(result.getErrorType()).isEqualTo(OperationResult.ErrorType.NOT_FOUND);
        }

        @Test
        void GIVEN_An_Existing_Perimeter_WHEN_Deleting_Perimeter_THEN_Success_And_Perimeter_Is_Deleted() {
            OperationResult<String> result = perimetersService.deletePerimeter("perimeter1");
            assertThat(result.isSuccess()).isTrue();
            assertThat(groupRepositoryStub.findById("perimeter1")).isEmpty();
        }

        @Test
        void GIVEN_An_Existing_Perimeter_WHEN_Deleting_Perimeter_THEN_Success_And_Groups_Are_Not_Linked_With_The_Perimeter_Anymore() {
            OperationResult<String> result = perimetersService.deletePerimeter("perimeter1");
            assertThat(result.isSuccess()).isTrue();
            assertThat(groupRepositoryStub.findById("group1").get().getPerimeters()).containsExactlyInAnyOrder("perimeter2");
            assertThat(groupRepositoryStub.findById("group2").get().getPerimeters()).doesNotContain("perimeter1");
        }

    }

    @Nested
    @DisplayName("Groups")
    class Users {

        @Nested
        @DisplayName("Add")
        class Add {
            @Test
            void GIVEN_Perimeter_Does_Not_Exist_WHEN_Adding_Groups_THEN_Return_NotFound() {
                OperationResult<String> result = perimetersService.addPerimeterGroups("dummyid", null);
                assertThat(result.isSuccess()).isFalse();
                assertThat(result.getErrorType()).isEqualTo(OperationResult.ErrorType.NOT_FOUND);
            }

            @Test
            void GIVEN_Groups_With_A_Not_Existing_One_WHEN_Adding_Them_To_Perimeters_THEN_Return_Bad_Request() {
                ArrayList<String> groups = new ArrayList<>();
                groups.add("group1");
                groups.add("dummyGroup");
                OperationResult<String> result = perimetersService.addPerimeterGroups("perimeter1", groups);
                assertThat(result.isSuccess()).isFalse();
                assertThat(result.getErrorType()).isEqualTo(OperationResult.ErrorType.BAD_REQUEST);
            }

            @Test
            void GIVEN_Existing_Groups_WHEN_Adding_Them_To_Perimeter_THEN_Succeed_And_Groups_Are_Updated() {

                perimeterRepositoryStub.insert(new PerimeterData("testPerimeter", "myname", null));

                ArrayList<String> groups = new ArrayList<>();
                groups.add("group1");
                groups.add("group2");
                OperationResult<String> result = perimetersService.addPerimeterGroups("testPerimeter", groups);
                Optional<Group> group1Updated = groupRepositoryStub.findById("group1");
                Optional<Group> group2Updated = groupRepositoryStub.findById("group2");
                Optional<Group> group3NotUpdated = groupRepositoryStub.findById("group3");
                assertThat(result.isSuccess()).isTrue();
                assertThat(group1Updated.get().getPerimeters()).containsExactlyInAnyOrder("perimeter1", "perimeter2",
                        "testPerimeter");
                assertThat(group2Updated.get().getPerimeters()).containsExactlyInAnyOrder("perimeter1",
                        "testPerimeter");
                assertThat(group3NotUpdated.get().getPerimeters()).containsExactlyInAnyOrder("perimeter2");

            }
        }

        @Nested
        @DisplayName("Update")
        class Update {
            @Test
            void GIVEN_Perimeter_Does_Not_Exist_WHEN_Updating_Group_List_THEN_Return_NotFound() {
                OperationResult<String> result = perimetersService.updatePerimeterGroups("dummyid", null);
                assertThat(result.isSuccess()).isFalse();
                assertThat(result.getErrorType()).isEqualTo(OperationResult.ErrorType.NOT_FOUND);
            }

            @Test
            void GIVEN_Existing_Perimeter_WHEN_Updating_Groups_With_A_Not_Existing_One_THEN_Return_Bad_Request() {
                ArrayList<String> groups = new ArrayList<>();
                groups.add("group1");
                groups.add("dummyUser");
                OperationResult<String> result = perimetersService.updatePerimeterGroups("perimeter1", groups);
                assertThat(result.isSuccess()).isFalse();
                assertThat(result.getErrorType()).isEqualTo(OperationResult.ErrorType.BAD_REQUEST);
            }

            @Test
            void GIVEN_Existing_Perimeter_WHEN_Update_Group_List_THEN_Succeed_And_Groups_Are_Updated() {

                ArrayList<String> groups = new ArrayList<>();
                groups.add("group1");
                groups.add("group2");
                OperationResult<String> result = perimetersService.updatePerimeterGroups("perimeter2", groups);
                Optional<Group> group1Updated = groupRepositoryStub.findById("group1");
                Optional<Group> group2Updated = groupRepositoryStub.findById("group2");
                Optional<Group> group3Updated = groupRepositoryStub.findById("group3");

                assertThat(result.isSuccess()).isTrue();
                assertThat(group1Updated.get().getPerimeters()).containsExactlyInAnyOrder("perimeter1", "perimeter2");
                assertThat(group2Updated.get().getPerimeters()).containsExactlyInAnyOrder("perimeter1", "perimeter2");
                assertThat(group3Updated.get().getPerimeters()).isEmpty();

            }

            @Test
            void GIVEN_Existing_Perimeter_WHEN_Update_With_Empty_Group_List_THEN_Succeed_And_Groups_Are_Updated() {
                ArrayList<String> groups = new ArrayList<>();
                OperationResult<String> result = perimetersService.updatePerimeterGroups("perimeter1", groups);
                Optional<Group> group1Updated = groupRepositoryStub.findById("group1");
                Optional<Group> group2Updated = groupRepositoryStub.findById("group2");
                Optional<Group> group3Updated = groupRepositoryStub.findById("group3");

                assertThat(result.isSuccess()).isTrue();
                assertThat(group1Updated.get().getPerimeters()).containsExactly("perimeter2");
                assertThat(group2Updated.get().getPerimeters()).isEmpty();
                assertThat(group3Updated.get().getPerimeters()).containsExactly("perimeter2");

            }
        }

        @Nested
        @DisplayName("Remove")
        class Remove {

            @Test
            void GIVEN_A_Not_Existing_Perimeter_WHEN_Try_To_Remove_Groups_THEN_Return_NOT_FOUND() {
                OperationResult<String> result = perimetersService.deletePerimeterGroups("dummyPerimeter");
                assertThat(result.isSuccess()).isFalse();
                assertThat(result.getErrorType()).isEqualTo(OperationResult.ErrorType.NOT_FOUND);
            }

            @Test
            void GIVEN_A_Perimeter_With_Groups_WHEN_Try_To_Remove_Groups_THEN_Success_And_Groups_Removed() {
                OperationResult<String> result = perimetersService.deletePerimeterGroups("perimeter1");
                Optional<Group> group1Updated = groupRepositoryStub.findById("group1");
                Optional<Group> group2Updated = groupRepositoryStub.findById("group2");
                Optional<Group> group3Updated = groupRepositoryStub.findById("group3");

                assertThat(result.isSuccess()).isTrue();
                assertThat(group1Updated.get().getPerimeters()).containsExactly("perimeter2");
                assertThat(group2Updated.get().getPerimeters()).isEmpty();
                assertThat(group3Updated.get().getPerimeters()).containsExactly("perimeter2");
            }

            @Test
            void GIVEN_A_None_Existing_Perimeter_WHEN_Try_Removing_From_Group_THEN_Failed_And_Return_NOT_FOUND() {
                OperationResult<String> result = perimetersService.deletePerimeterGroup("dummyPerimeter", "group1");
                assertThat(result.isSuccess()).isFalse();
                assertThat(result.getErrorType()).isEqualTo(OperationResult.ErrorType.NOT_FOUND);
            }

            @Test
            void GIVEN_A_Perimeter_WHEN_Try_Removing_From_Not_Existing_Group_THEN_Failed_And_Return_NOT_FOUND() {
                OperationResult<String> result = perimetersService.deletePerimeterGroup("perimeter1", "dummyGroup");
                assertThat(result.isSuccess()).isFalse();
                assertThat(result.getErrorType()).isEqualTo(OperationResult.ErrorType.NOT_FOUND);
            }

            @Test
            void GIVEN_A_User_WHEN_Try_Removing_From_Group_THEN_Success_And_User_Removed_From_Group() {
                OperationResult<String> result = perimetersService.deletePerimeterGroup("perimeter1",
                        "group1");
                Optional<Group> group1Updated = groupRepositoryStub.findById("group1");
                Optional<Group> group2Updated = groupRepositoryStub.findById("group2");
                Optional<Group> group3Updated = groupRepositoryStub.findById("group3");

                assertThat(result.isSuccess()).isTrue();
                assertThat(group1Updated.get().getPerimeters()).containsExactly("perimeter2");
                assertThat(group2Updated.get().getPerimeters()).containsExactly("perimeter1");
                assertThat(group3Updated.get().getPerimeters()).containsExactly("perimeter2");
            }
        }

    }

}
