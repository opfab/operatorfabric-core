/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.lfenergy.operatorfabric.users.repositories;

import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.lfenergy.operatorfabric.users.application.UnitTestApplication;
import org.lfenergy.operatorfabric.users.model.UserData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * <p></p>
 * Created on 13/09/18
 *
 * @author David Binder
 */
@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = UnitTestApplication.class)
@ActiveProfiles(profiles = {"default","test"})
@Slf4j
@Tag("end-to-end")
@Tag("mongo")
public class UserRepositoryShould {

    @Autowired
    private UserRepository repository;

    @BeforeEach
    public void init(){
        UserData u1,u2,u3;
        u1 = UserData.builder()
           .login("jcleese")
           .firstName("John")
           .lastName("Cleese")
           .group("Monthy Pythons").group("Wanda")
           .build();
        u2 = UserData.builder()
           .login("gchapman")
           .firstName("Graham")
           .lastName("Chapman")
           .group("Monthy Pythons")
           .build();
        u3 = UserData.builder()
           .login("kkline")
           .firstName("Kevin")
           .lastName("Kline")
           .group("Wanda")
           .build();
        repository.insert(u1);
        repository.insert(u2);
        repository.insert(u3);
    }

    @AfterEach
    public void clean(){
        repository.deleteAll();
    }

    @Test
    public void persistUser(){
        UserData user = UserData.builder()
           .login("mpalin")
           .firstName("Michael")
           .lastName("Palin")
           .group("Monthy Pythons").group("Wanda")
           .build();
        repository.insert(user);
        assertThat(repository.count()).isEqualTo(4);
        UserData mpalin = repository.findById("mpalin").get();
        assertThat(mpalin).isNotNull();
        assertThat(mpalin.getLogin()).isEqualTo("mpalin");
        assertThat(mpalin.getFirstName()).isEqualTo("Michael");
        assertThat(mpalin.getLastName()).isEqualTo("Palin");
        assertThat(mpalin.getGroups()).contains("Monthy Pythons", "Wanda");
    }

    @Test
    public void findByGroup(){
        List<UserData> results = repository.findByGroupSetContaining("Wanda");
        assertThat(results).hasSize(2);
        results = repository.findByGroupSetContaining("Monthy Pythons");
        assertThat(results).hasSize(2);
        results = repository.findByGroupSetContaining("Marx Brothers");
        assertThat(results).hasSize(0);
    }


}