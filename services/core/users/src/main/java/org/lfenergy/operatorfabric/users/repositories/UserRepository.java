package org.lfenergy.operatorfabric.users.repositories;

import org.lfenergy.operatorfabric.users.model.UserData;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Mongo {@link UserData} repository
 * @author David Binder
 */
@Repository
public interface UserRepository extends MongoRepository<UserData,String> {

    Page<UserData> findAll(Pageable pageable);
    List<UserData> findByGroupSetContaining(String groupContains);

}
