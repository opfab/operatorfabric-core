package org.lfenergy.operatorfabric.users.repositories;

import org.lfenergy.operatorfabric.users.model.GroupData;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

/**
 * Mongo {@link GroupData} repository
 * @author David Binder
 */
@Repository
public interface GroupRepository extends MongoRepository<GroupData,String> {

    Page<GroupData> findAll(Pageable pageable);

}
