package org.lfenergy.operatorfabric.users.controllers;

import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.lfenergy.operatorfabric.users.application.UnitTestApplication;
import org.lfenergy.operatorfabric.users.application.configuration.WithMockOpFabUser;
import org.lfenergy.operatorfabric.users.model.EntityData;
import org.lfenergy.operatorfabric.users.model.UserData;
import org.lfenergy.operatorfabric.users.repositories.EntityRepository;
import org.lfenergy.operatorfabric.users.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.context.WebApplicationContext;

import java.util.stream.Collectors;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.webAppContextSetup;

@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = UnitTestApplication.class)
@ActiveProfiles("test")
@WebAppConfiguration
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@Tag("end-to-end")
@Tag("mongo")
public class CurrentUserWithPerimetersControllerShould {

    private MockMvc mockMvc;
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EntityRepository entityRepository;

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private CurrentUserWithPerimetersController testedController;

    @BeforeAll
    void setup() throws Exception {
        this.mockMvc = webAppContextSetup(webApplicationContext).apply(springSecurity()).build();
    }


    UserData u1, u2, u3;
    public static final String ROOT_ENTITY = "root-entity";
    public static final String CHILD_ENTITY = "child-entity";

    public static final String GRAND_CHILD_ENTITY = "grand-child-entity";

    public static final String ENTITY_1 = "ENTITY1";

    public static final String ENTITY_2 = "ENTITY2";

    {
        u1 = UserData.builder()
                .login("jcleese")
                .firstName("John")
                .lastName("Cleese")
                .group("Monty Pythons").group("Wanda")
                .entity(GRAND_CHILD_ENTITY).entity(ENTITY_1)
                .build();
        u2 = UserData.builder()
                .login("gchapman")
                .firstName("Graham")
                .lastName("Chapman")
                .group("Monty Pythons")
                .entity(ENTITY_1)
                .build();
        u3 = UserData.builder()
                .login("kkline")
                .firstName("Kevin")
                .lastName("Kline")
                .group("Wanda")
                .entity(ROOT_ENTITY)
                .entity(CHILD_ENTITY)
                .build();
    }

    @BeforeEach
    public void init() {
        EntityData e0, e1, e2;
        e0 = EntityData.builder()
                .name("Root entity")
                .id(ROOT_ENTITY)
                .description("this entity has no parents")
                .build();
        entityRepository.insert(e0);
        e1 = EntityData.builder()
                .name("Child entity")
                .id(CHILD_ENTITY)
                .description("this entity has one parent")
                .parents(Stream.of(e0.getId()).collect(Collectors.toSet()))
                .build();
        entityRepository.insert(e1);
        e2 = EntityData.builder()
                .name("Grand child entity")
                .id(GRAND_CHILD_ENTITY)
                .description("this entity has one parent and one grand-parent")
                .parents(Stream.of(e1.getId()).collect(Collectors.toSet()))
                .build();
        entityRepository.insert(e2);
        userRepository.insert(u1);
        userRepository.insert(u2);
        userRepository.insert(u3);
    }

    @AfterEach
    public void clean() {
        userRepository.deleteAll();
        entityRepository.deleteAll();
    }

    @Nested
    @WithMockOpFabUser(login = "testAdminUser", roles = {"ADMIN"})
    class GivenAdminUserEntitiesControllerShould {

        @Test
        void addTransitiveEntitiesToCurrentUserWithPerimeters() throws Exception {
            UserData currentUser = u1;
            testedController.handleEntities(currentUser);
            // initial entities
            assertThat(currentUser.getEntities()).contains(GRAND_CHILD_ENTITY);
            assertThat(currentUser.getEntities()).contains(ENTITY_1);
            // transitive entities
            assertThat(currentUser.getEntities()).contains(ROOT_ENTITY);
            assertThat(currentUser.getEntities()).contains(CHILD_ENTITY);
            // other entities
            assertThat(currentUser.getEntities()).doesNotContain(ENTITY_2);
        }

        @Test
        void addNoTransitiveEntityToCurrentUserWithPerimeters() throws Exception {
            UserData currentUser = u2;
            testedController.handleEntities(currentUser);
            // initial entities
            assertThat(currentUser.getEntities()).contains(ENTITY_1);
            // other entities
            assertThat(currentUser.getEntities()).doesNotContain(GRAND_CHILD_ENTITY);
            assertThat(currentUser.getEntities()).doesNotContain(ENTITY_2);
            assertThat(currentUser.getEntities()).doesNotContain(ROOT_ENTITY);
            assertThat(currentUser.getEntities()).doesNotContain(CHILD_ENTITY);
        }
        @Test
        void containesDeclaredTransitiveEntitiesToCurrentUserWithPerimeters() throws Exception {
            UserData currentUser = u3;
            testedController.handleEntities(currentUser);
            // initial entities
            assertThat(currentUser.getEntities()).contains(ROOT_ENTITY);
            assertThat(currentUser.getEntities()).contains(CHILD_ENTITY);
            // other entities
            assertThat(currentUser.getEntities()).doesNotContain(GRAND_CHILD_ENTITY);
            assertThat(currentUser.getEntities()).doesNotContain(ENTITY_2);
            assertThat(currentUser.getEntities()).doesNotContain(ENTITY_1);
        }
    }
}
