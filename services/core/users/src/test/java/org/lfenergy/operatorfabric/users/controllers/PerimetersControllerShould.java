/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


package org.lfenergy.operatorfabric.users.controllers;

import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.lfenergy.operatorfabric.users.application.UnitTestApplication;
import org.lfenergy.operatorfabric.users.application.configuration.WithMockOpFabUser;
import org.lfenergy.operatorfabric.users.model.GroupData;
import org.lfenergy.operatorfabric.users.model.PerimeterData;
import org.lfenergy.operatorfabric.users.model.RightsEnum;
import org.lfenergy.operatorfabric.users.model.UserData;
import org.lfenergy.operatorfabric.users.repositories.GroupRepository;
import org.lfenergy.operatorfabric.users.repositories.PerimeterRepository;
import org.lfenergy.operatorfabric.users.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.cloud.bus.ServiceMatcher;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.web.context.WebApplicationContext;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.webAppContextSetup;

@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = UnitTestApplication.class)
@ActiveProfiles("test")
@WebAppConfiguration
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@Tag("end-to-end")
@Tag("mongo")
class PerimetersControllerShould {

    private MockMvc mockMvc;

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private PerimeterRepository perimeterRepository;

    @Autowired
    private UserRepository userRepository;

    @MockBean
    private ServiceMatcher busServiceMatcher;

    @MockBean
    private ApplicationEventPublisher publisher;

    @Autowired
    private WebApplicationContext webApplicationContext;

    @BeforeAll
    void setup() throws Exception {
        this.mockMvc = webAppContextSetup(webApplicationContext)
                .apply(springSecurity())
                .build();
    }

    @BeforeEach
    public void init(){
        UserData u1,u2,u3;
        u1 = UserData.builder()
                .login("jcleese")
                .firstName("John")
                .lastName("Cleese")
                .group("G1").group("G2")
                .build();
        u2 = UserData.builder()
                .login("gchapman")
                .firstName("Graham")
                .lastName("Chapman")
                .group("G1")
                .entity("entity1").entity("entity2")
                .build();
        u3 = UserData.builder()
                .login("kkline")
                .firstName("Kevin")
                .lastName("Kline")
                .group("G2")
                .entity("entity1")
                .build();
        userRepository.insert(u1);
        userRepository.insert(u2);
        userRepository.insert(u3);

        GroupData g1, g2, g3;
        g1 = GroupData.builder()
                .id("G1")
                .name("Group 1")
                .description("Group 1 description")
                .perimeter("PERIMETER1_1").perimeter("PERIMETER1_2")
                .build();
        g2 = GroupData.builder()
                .id("G2")
                .name("Group 2")
                .description("Group 2 description")
                .perimeter("PERIMETER1_1")
                .build();
        g3 = GroupData.builder()
                .id("G3")
                .name("Group 3")
                .description("Group 3 description")
                .perimeter("PERIMETER1_2")
                .build();
        groupRepository.insert(g1);
        groupRepository.insert(g2);
        groupRepository.insert(g3);

        PerimeterData p1, p2;
        p1 = PerimeterData.builder()
                .id("PERIMETER1_1")
                .process("process1")
                .state("state1")
                .rights(RightsEnum.READ)
                .build();
        p2 = PerimeterData.builder()
                .id("PERIMETER1_2")
                .process("process1")
                .state("state2")
                .rights(RightsEnum.READANDWRITE)
                .build();
        perimeterRepository.insert(p1);
        perimeterRepository.insert(p2);
    }

    @AfterEach
    public void clean(){
        userRepository.deleteAll();
        groupRepository.deleteAll();
        perimeterRepository.deleteAll();
    }

    @Nested
    @WithMockOpFabUser(login="testAdminUser", roles = { "ADMIN" })
    class GivenAdminUserPerimetersControllerShould {

        @Test
        void fetchAll() throws Exception {
            ResultActions result = mockMvc.perform(get("/perimeters"));
            result
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$", hasSize(2)))
            ;
        }

        @Test
        void fetch() throws Exception {
            ResultActions result = mockMvc.perform(get("/perimeters/PERIMETER1_1"));
            result
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.id", is("PERIMETER1_1")))
                    .andExpect(jsonPath("$.process", is("process1")))
                    .andExpect(jsonPath("$.state", is("state1")))
                    .andExpect(jsonPath("$.rights", is("Read")))
            ;
        }

        @Test
        void fetchWithError() throws Exception {
            ResultActions result = mockMvc.perform(get("/perimeters/PERIMETER1_3"));
            result
                    .andExpect(status().is(HttpStatus.NOT_FOUND.value()))
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.status", is(HttpStatus.NOT_FOUND.name())))
                    .andExpect(jsonPath("$.message", is(String.format(PerimetersController.PERIMETER_NOT_FOUND_MSG, "PERIMETER1_3"))))
                    .andExpect(jsonPath("$.errors").doesNotExist())
            ;
        }

        @Test
        void create() throws Exception {
            mockMvc.perform(post("/perimeters")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{" +
                            "\"id\": \"PERIMETER1_3\"," +
                            "\"process\": \"process1\"," +
                            "\"state\": \"state3\"," +
                            "\"rights\": \"ReadAndWrite\"" +
                            "}")
            )
                    .andExpect(status().isCreated())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.id", is("PERIMETER1_3")))
                    .andExpect(jsonPath("$.process", is("process1")))
                    .andExpect(jsonPath("$.state", is("state3")))
                    .andExpect(jsonPath("$.rights", is("ReadAndWrite")))
            ;

            mockMvc.perform(post("/perimeters")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{" +
                            "\"id\": \"PERIMETER1_3\"," +
                            "\"process\": \"process1\"," +
                            "\"state\": \"state3\"," +
                            "\"rights\": \"ReadAndWrite\"" +
                            "}")
            )
                    .andExpect(status().is(HttpStatus.BAD_REQUEST.value()))
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.status", is(HttpStatus.BAD_REQUEST.name())))
                    .andExpect(jsonPath("$.message", is("Resource creation failed because a resource with the same key already exists.")))
                    .andExpect(jsonPath("$.errors[0]", is("Duplicate key : PERIMETER1_3")))
            ;

            mockMvc.perform(get("/perimeters"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$", hasSize(3)));

            mockMvc.perform(get("/perimeters/PERIMETER1_3"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.id", is("PERIMETER1_3")))
                    .andExpect(jsonPath("$.process", is("process1")))
                    .andExpect(jsonPath("$.state", is("state3")))
                    .andExpect(jsonPath("$.rights", is("ReadAndWrite")))
            ;
        }

        @Test
        void update() throws Exception {
            mockMvc.perform(put("/perimeters/PERIMETER1_2")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{" +
                            "\"id\": \"PERIMETER1_2\"," +
                            "\"process\": \"process1\"," +
                            "\"state\": \"state2\"," +
                            "\"rights\": \"Read\"" +
                            "}")
            )
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.id", is("PERIMETER1_2")))
                    .andExpect(jsonPath("$.process", is("process1")))
                    .andExpect(jsonPath("$.state", is("state2")))
                    .andExpect(jsonPath("$.rights", is("Read")))
            ;

            mockMvc.perform(get("/perimeters"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$", hasSize(2)));

            mockMvc.perform(get("/perimeters/PERIMETER1_2"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.id", is("PERIMETER1_2")))
                    .andExpect(jsonPath("$.process", is("process1")))
                    .andExpect(jsonPath("$.state", is("state2")))
                    .andExpect(jsonPath("$.rights", is("Read")))
            ;
        }

        @Test
        void updateWithMismatchedError() throws Exception {

            mockMvc.perform(get("/perimeters/PERIMETER1_2"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.id", is("PERIMETER1_2")))
                    .andExpect(jsonPath("$.process", is("process1")))
                    .andExpect(jsonPath("$.state", is("state2")))
                    .andExpect(jsonPath("$.rights", is("ReadAndWrite")))
            ;

            mockMvc.perform(put("/perimeters/PERIMETER1_2")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{" +
                            "\"id\": \"PERIMETER1_1\"," +
                            "\"process\": \"process1\"," +
                            "\"state\": \"state2\"," +
                            "\"rights\": \"Read\"" +
                            "}")
            )
                    .andExpect(status().is(HttpStatus.BAD_REQUEST.value()))
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.status", is(HttpStatus.BAD_REQUEST.name())))
                    .andExpect(jsonPath("$.message", is(PerimetersController.NO_MATCHING_PERIMETER_ID_MSG)))
                    .andExpect(jsonPath("$.errors").doesNotExist());
            ;

            mockMvc.perform(get("/perimeters/PERIMETER1_2"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.id", is("PERIMETER1_2")))
                    .andExpect(jsonPath("$.process", is("process1")))
                    .andExpect(jsonPath("$.state", is("state2")))
                    .andExpect(jsonPath("$.rights", is("ReadAndWrite")))
            ;
        }

        @Test
        void updateWithMismatchedAndNotFoundError() throws Exception {

            mockMvc.perform(get("/perimeters/unknownPerimeterSoFar"))
                    .andExpect(status().is(HttpStatus.NOT_FOUND.value()))
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.status", is(HttpStatus.NOT_FOUND.name())))
                    .andExpect(jsonPath("$.message", is(String.format(PerimetersController.PERIMETER_NOT_FOUND_MSG, "unknownPerimeterSoFar"))))
                    .andExpect(jsonPath("$.errors").doesNotExist())
            ;

            mockMvc.perform(put("/perimeters/unknownPerimeterSoFar")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{" +
                            "\"id\": \"someOtherPerimeterId\"," +
                            "\"process\": \"someOtherPerimeterProcess\"," +
                            "\"state\": \"stateOther\"," +
                            "\"rights\": \"Read\"" +
                            "}")
            )
                    .andExpect(status().is(HttpStatus.BAD_REQUEST.value()))
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.status", is(HttpStatus.BAD_REQUEST.name())))
                    .andExpect(jsonPath("$.message", is(String.format(PerimetersController.NO_MATCHING_PERIMETER_ID_MSG, "unknownPerimeterSoFar"))))
                    .andExpect(jsonPath("$.errors").doesNotExist())
            ;

            mockMvc.perform(get("/perimeters/unknownPerimeterSoFar"))
                    .andExpect(status().is(HttpStatus.NOT_FOUND.value()))
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.status", is(HttpStatus.NOT_FOUND.name())))
                    .andExpect(jsonPath("$.message", is(String.format(PerimetersController.PERIMETER_NOT_FOUND_MSG, "unknownPerimeterSoFar"))))
                    .andExpect(jsonPath("$.errors").doesNotExist())
            ;
        }

        @Test
        void addPerimeterToGroups() throws Exception {
            mockMvc.perform(patch("/perimeters/PERIMETER1_2/groups")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("[\"G2\"]")
            )
                    .andExpect(status().isOk())
            ;

            GroupData g2 = groupRepository.findById("G2").get();
            assertThat(g2).isNotNull();
            assertThat(g2.getPerimeters()).containsExactly("PERIMETER1_1", "PERIMETER1_2");
            GroupData g1 = groupRepository.findById("G1").get();
            assertThat(g1).isNotNull();
            assertThat(g1.getPerimeters()).containsExactly("PERIMETER1_1", "PERIMETER1_2");
            GroupData g3 = groupRepository.findById("G3").get();
            assertThat(g3).isNotNull();
            assertThat(g3.getPerimeters()).containsExactly("PERIMETER1_2");
        }

        @Test
        void addPerimeterToGroupsWithNotFoundError() throws Exception {

            mockMvc.perform(get("/perimeters/unknownPerimeterSoFar"))
                    .andExpect(status().is(HttpStatus.NOT_FOUND.value()))
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.status", is(HttpStatus.NOT_FOUND.name())))
                    .andExpect(jsonPath("$.message", is(String.format(PerimetersController.PERIMETER_NOT_FOUND_MSG, "unknownPerimeterSoFar"))))
                    .andExpect(jsonPath("$.errors").doesNotExist())
            ;

            mockMvc.perform(patch("/perimeters/unknownPerimeterSoFar/groups")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("[\"G2\"]")
            )
                    .andExpect(status().is(HttpStatus.NOT_FOUND.value()))
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.status", is(HttpStatus.NOT_FOUND.name())))
                    .andExpect(jsonPath("$.message", is(String.format(PerimetersController.PERIMETER_NOT_FOUND_MSG, "unknownPerimeterSoFar"))))
                    .andExpect(jsonPath("$.errors").doesNotExist())
            ;

            GroupData g2 = groupRepository.findById("G2").get();
            assertThat(g2).isNotNull();
            assertThat(g2.getPerimeters()).doesNotContain("unknownPerimeterSoFar");

            mockMvc.perform(get("/perimeters/unknownPerimeterSoFar"))
                    .andExpect(status().is(HttpStatus.NOT_FOUND.value()))
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.status", is(HttpStatus.NOT_FOUND.name())))
                    .andExpect(jsonPath("$.message", is(String.format(PerimetersController.PERIMETER_NOT_FOUND_MSG, "unknownPerimeterSoFar"))))
                    .andExpect(jsonPath("$.errors").doesNotExist())
            ;
        }

        @Test
        void addPerimeterToGroupsWithBadRequest() throws Exception {
            mockMvc.perform(patch("/perimeters/PERIMETER1_2/groups")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("[\"G2\",\"unknownGroupSoFar\"]")
            )
                    .andExpect(status().is(HttpStatus.BAD_REQUEST.value()))
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.status", is(HttpStatus.BAD_REQUEST.name())))
                    .andExpect(jsonPath("$.message", is(String.format(PerimetersController.BAD_GROUP_LIST_MSG, "unknownGroupSoFar"))))
                    .andExpect(jsonPath("$.errors").doesNotExist());

            //If the group list isn't correct, no group should be updated
            GroupData g2 = groupRepository.findById("G2").get();
            assertThat(g2).isNotNull();
            assertThat(g2.getPerimeters()).containsExactly("PERIMETER1_1");

            mockMvc.perform(get("/groups/unknownGroupSoFar"))
                    .andExpect(status().is(HttpStatus.NOT_FOUND.value()))
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.status", is(HttpStatus.NOT_FOUND.name())))
                    .andExpect(jsonPath("$.message", is(String.format(GroupsController.GROUP_NOT_FOUND_MSG, "unknownGroupSoFar"))))
                    .andExpect(jsonPath("$.errors").doesNotExist());
        }

        @Test
        void addPerimeterToFreshlyNewGroup() throws Exception {

            String newGroupName = "freshly-new-group";

            mockMvc.perform(post("/groups")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{" +
                            "\"id\": \"" + newGroupName + "\"," +
                            "\"name\": \"Freshly New Group\"," +
                            "\"description\": \"Freshly New Group description\"" +
                            "}")
            ).andExpect(status().isCreated())
                    .andExpect(header().string("Location","/groups/"+newGroupName));

            mockMvc.perform(put("/perimeters/PERIMETER1_2/groups")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("[\"" + newGroupName + "\"]")
            )
                    .andExpect(status().isOk());

            GroupData freshlyNewGroup = groupRepository.findById(newGroupName).get();
            assertThat(freshlyNewGroup).isNotNull();
            assertThat(freshlyNewGroup.getPerimeters()).containsExactly("PERIMETER1_2");

            GroupData g1 = groupRepository.findById("G1").get();
            assertThat(g1).isNotNull();
            assertThat(g1.getPerimeters()).containsExactly("PERIMETER1_1");

            GroupData g3 = groupRepository.findById("G3").get();
            assertThat(g3).isNotNull();
            assertThat(g3.getPerimeters()).isEmpty();

        }

        @Test
        void deletePerimetersFromGroups() throws Exception {
            List<GroupData> groupsHavingPerimeter1_1 = groupRepository.findByPerimetersContaining("PERIMETER1_1");
            assertThat(groupsHavingPerimeter1_1.size()).isEqualTo(2);
            mockMvc.perform(delete("/perimeters/PERIMETER1_1/groups")
                    .contentType(MediaType.APPLICATION_JSON)
            )
                    .andExpect(status().isOk())
            ;

            groupsHavingPerimeter1_1 = groupRepository.findByPerimetersContaining("PERIMETER1_1");
            assertThat(groupsHavingPerimeter1_1).isEmpty();
        }

        @Test
        void deletePerimetersFromGroup() throws Exception {
            List<GroupData> groupsHavingPerimeter1_1 = groupRepository.findByPerimetersContaining("PERIMETER1_1");
            assertThat(groupsHavingPerimeter1_1.size()).isEqualTo(2);
            mockMvc.perform(delete("/perimeters/PERIMETER1_1/groups/G2")
                    .contentType(MediaType.APPLICATION_JSON)
            )
                    .andExpect(status().isOk())
            ;

            groupsHavingPerimeter1_1 = groupRepository.findByPerimetersContaining("PERIMETER1_1");
            assertThat(groupsHavingPerimeter1_1.size()).isEqualTo(1);
        }

        @Test
        void deletePerimeterFromGroupsWithNotFoundError() throws Exception {

            mockMvc.perform(get("/perimeters/unknownPerimeterSoFar"))
                    .andExpect(status().is(HttpStatus.NOT_FOUND.value()))
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.status", is(HttpStatus.NOT_FOUND.name())))
                    .andExpect(jsonPath("$.message", is(String.format(PerimetersController.PERIMETER_NOT_FOUND_MSG, "unknownPerimeterSoFar"))))
                    .andExpect(jsonPath("$.errors").doesNotExist())
            ;

            mockMvc.perform(delete("/perimeters/unknownPerimeterSoFar/groups")
                    .contentType(MediaType.APPLICATION_JSON)
            )
                    .andExpect(status().is(HttpStatus.NOT_FOUND.value()))
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.status", is(HttpStatus.NOT_FOUND.name())))
                    .andExpect(jsonPath("$.message", is(String.format(PerimetersController.PERIMETER_NOT_FOUND_MSG, "unknownPerimeterSoFar"))))
                    .andExpect(jsonPath("$.errors").doesNotExist())
            ;

            mockMvc.perform(get("/perimeters/unknownPerimeterSoFar"))
                    .andExpect(status().is(HttpStatus.NOT_FOUND.value()))
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.status", is(HttpStatus.NOT_FOUND.name())))
                    .andExpect(jsonPath("$.message", is(String.format(PerimetersController.PERIMETER_NOT_FOUND_MSG, "unknownPerimeterSoFar"))))
                    .andExpect(jsonPath("$.errors").doesNotExist())
            ;
        }

        @Test
        void deletePerimeterFromGroupWithNotFoundError() throws Exception {

            mockMvc.perform(get("/perimeters/unknownPerimeterSoFar"))
                    .andExpect(status().is(HttpStatus.NOT_FOUND.value()))
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.status", is(HttpStatus.NOT_FOUND.name())))
                    .andExpect(jsonPath("$.message", is(String.format(PerimetersController.PERIMETER_NOT_FOUND_MSG, "unknownPerimeterSoFar"))))
                    .andExpect(jsonPath("$.errors").doesNotExist())
            ;

            mockMvc.perform(delete("/perimeters/unknownPerimeterSoFar/groups/G2")
                    .contentType(MediaType.APPLICATION_JSON)
            )
                    .andExpect(status().is(HttpStatus.NOT_FOUND.value()))
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.status", is(HttpStatus.NOT_FOUND.name())))
                    .andExpect(jsonPath("$.message", is(String.format(PerimetersController.PERIMETER_NOT_FOUND_MSG, "unknownPerimeterSoFar"))))
                    .andExpect(jsonPath("$.errors").doesNotExist())
            ;

            mockMvc.perform(get("/perimeters/unknownPerimeterSoFar"))
                    .andExpect(status().is(HttpStatus.NOT_FOUND.value()))
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.status", is(HttpStatus.NOT_FOUND.name())))
                    .andExpect(jsonPath("$.message", is(String.format(PerimetersController.PERIMETER_NOT_FOUND_MSG, "unknownPerimeterSoFar"))))
                    .andExpect(jsonPath("$.errors").doesNotExist())
            ;

        }

        @Test
        void updatePerimetersFromGroups() throws Exception {
            mockMvc.perform(put("/perimeters/PERIMETER1_2/groups")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("[\"G2\"]")
            )
                    .andExpect(status().isOk())
            ;

            GroupData g2 = groupRepository.findById("G2").get();
            assertThat(g2).isNotNull();
            assertThat(g2.getPerimeters()).containsExactly("PERIMETER1_1", "PERIMETER1_2");

            GroupData g1 = groupRepository.findById("G1").get();
            assertThat(g1).isNotNull();
            assertThat(g1.getPerimeters()).containsExactly("PERIMETER1_1");

            GroupData g3 = groupRepository.findById("G3").get();
            assertThat(g3).isNotNull();
            assertThat(g3.getPerimeters()).isEmpty();
        }

        @Test
        void updatePerimeterFromGroupsWithNotFoundError() throws Exception {

            mockMvc.perform(get("/perimeters/unknownPerimeterSoFar"))
                    .andExpect(status().is(HttpStatus.NOT_FOUND.value()))
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.status", is(HttpStatus.NOT_FOUND.name())))
                    .andExpect(jsonPath("$.message", is(String.format(PerimetersController.PERIMETER_NOT_FOUND_MSG, "unknownPerimeterSoFar"))))
                    .andExpect(jsonPath("$.errors").doesNotExist())
            ;

            mockMvc.perform(put("/perimeters/unknownPerimeterSoFar/groups")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("[\"G2\"]")
            )
                    .andExpect(status().is(HttpStatus.NOT_FOUND.value()))
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.status", is(HttpStatus.NOT_FOUND.name())))
                    .andExpect(jsonPath("$.message", is(String.format(PerimetersController.PERIMETER_NOT_FOUND_MSG, "unknownPerimeterSoFar"))))
                    .andExpect(jsonPath("$.errors").doesNotExist())
            ;

            GroupData g2 = groupRepository.findById("G2").get();
            assertThat(g2).isNotNull();
            assertThat(g2.getPerimeters()).doesNotContain("unknownPerimeterSoFar");

            mockMvc.perform(get("/perimeters/unknownPerimeterSoFar"))
                    .andExpect(status().is(HttpStatus.NOT_FOUND.value()))
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.status", is(HttpStatus.NOT_FOUND.name())))
                    .andExpect(jsonPath("$.message", is(String.format(PerimetersController.PERIMETER_NOT_FOUND_MSG, "unknownPerimeterSoFar"))))
                    .andExpect(jsonPath("$.errors").doesNotExist())
            ;
        }

        @Test
        void updatePerimeterFromGroupsWithBadRequest() throws Exception {

            mockMvc.perform(put("/perimeters/PERIMETER1_2/groups")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("[\"G2\",\"unknownGroupSoFar\"]")
            )
                    .andExpect(status().is(HttpStatus.BAD_REQUEST.value()))
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.status", is(HttpStatus.BAD_REQUEST.name())))
                    .andExpect(jsonPath("$.message", is(String.format(PerimetersController.BAD_GROUP_LIST_MSG, "unknownGroupSoFar"))))
                    .andExpect(jsonPath("$.errors").doesNotExist());

            //If the group list isn't correct, no group should be updated
            GroupData g3 = groupRepository.findById("G3").get();
            assertThat(g3).isNotNull();
            assertThat(g3.getPerimeters()).containsExactly("PERIMETER1_2");

            GroupData g2 = groupRepository.findById("G2").get();
            assertThat(g2).isNotNull();
            assertThat(g2.getPerimeters()).doesNotContain("PERIMETER1_2");

            mockMvc.perform(get("/groups/unknownGroupSoFar"))
                    .andExpect(status().is(HttpStatus.NOT_FOUND.value()))
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.status", is(HttpStatus.NOT_FOUND.name())))
                    .andExpect(jsonPath("$.message", is(String.format(GroupsController.GROUP_NOT_FOUND_MSG, "unknownGroupSoFar"))))
                    .andExpect(jsonPath("$.errors").doesNotExist());

        }
    }

    @Nested
    @WithMockOpFabUser(login="gchapman", roles = { "Monty Pythons" })
    class GivenNonAdminUserPerimetersControllerShould {

        @Test
        void fetchAll() throws Exception {
            ResultActions result = mockMvc.perform(get("/perimeters"));
            result
                    .andExpect(status().is(HttpStatus.FORBIDDEN.value()))
            ;
        }

        @Test
        void fetch() throws Exception {
            ResultActions result = mockMvc.perform(get("/perimeters/PERIMETER1_1"));
            result
                    .andExpect(status().is(HttpStatus.FORBIDDEN.value()))
            ;
        }

        @Test
        void create() throws Exception {
            mockMvc.perform(post("/perimeters")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{" +
                            "\"id\": \"PERIMETER1_3\","+
                            "\"process\": \"process1\","+
                            "\"state\": \"state3\","+
                            "\"rights\": \"ReadAndWrite\""+
                            "}")
            )
                    .andExpect(status().is(HttpStatus.FORBIDDEN.value()))
            ;
        }

        @Test
        void update() throws Exception {
            mockMvc.perform(put("/perimeters/PERIMETER1_2")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{" +
                            "\"id\": \"PERIMETER1_2\","+
                            "\"process\": \"process1\","+
                            "\"state\": \"state2\","+
                            "\"rights\": \"Read\""+
                            "}")
            )
                    .andExpect(status().is(HttpStatus.FORBIDDEN.value()))
            ;
        }


        @Test
        void addPerimeterToGroups() throws Exception {
            mockMvc.perform(post("/perimeters/PERIMETER1_2/groups")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("[\"G2\"]")
            )
                    .andExpect(status().is(HttpStatus.FORBIDDEN.value()))
            ;
        }


        @Test
        void deletePerimetersFromGroups() throws Exception {
            mockMvc.perform(delete("/perimeters/PERIMETER1_1/groups/G2")
                    .contentType(MediaType.APPLICATION_JSON)
            )
                    .andExpect(status().is(HttpStatus.FORBIDDEN.value()))
            ;
        }

        @Test
        void updatePerimetersFromGroups() throws Exception {
            mockMvc.perform(put("/perimeters/PERIMETER1_2/groups")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("[\"G2\"]")
            )
                    .andExpect(status().is(HttpStatus.FORBIDDEN.value()))
            ;
        }
    }
}
