#/bin/sh

rm -rf target

# Be careful : patchUserSettings must be before fetchUserSettings

java -jar karate.jar                                         \
      common/checkExpiredToken.feature                       \
      users/createUsers.feature                              \
      users/groups/createGroups.feature                      \
      users/groups/addUsersToGroup.feature                   \
      users/entities/createEntities.feature                  \
      users/entities/addUsersToEntity.feature                \
      users/perimeters/createPerimeters.feature              \
      users/perimeters/addGroupsToPerimeter.feature          \
      users/patchUserSettings.feature                        \
      users/fetchExistingUser.feature                        \
      users/fetchUserSettings.feature                        \
      users/groups/getGroupDetails.feature                   \
      users/groups/getGroups.feature                         \
      users/entities/getEntityDetails.feature                \
      users/entities/getEntities.feature                     \
      users/perimeters/getPerimeterDetails.feature           \
      users/perimeters/getPerimeters.feature                 \
      users/getUsers.feature                                 \
      users/groups/updateExistingGroup.feature               \
      users/entities/updateExistingEntity.feature            \
      users/perimeters/updateExistingPerimeter.feature       \
      users/updateExistingUser.feature                       \
      users/groups/updateListOfGroupUsers.feature            \
      users/groups/deleteAllUsersFromAGroup.feature          \
      users/groups/deleteUserFromGroup.feature               \
      users/entities/updateListOfEntityUsers.feature         \
      users/entities/deleteAllUsersFromAnEntity.feature      \
      users/entities/deleteUserFromEntity.feature            \
      users/perimeters/updateListOfPerimeterGroups.feature   \
      users/perimeters/deleteAllGroupsFromAPerimeter.feature \
      users/perimeters/deleteGroupFromPerimeter.feature      \
      users/perimeters/getPerimetersForAUser.feature         \
      users/perimeters/getPerimetersForAGroup.feature        \
      users/perimeters/updatePerimetersForAGroup.feature     \
      users/perimeters/addPerimetersForAGroup.feature        \
      users/perimeters/getCurrentUserWithPerimeters.feature  \
      users/perimeters/postCardRoutingPerimeters.feature     \
      users/deleteUser.feature                               \
      users/entities/deleteEntity.feature                    \
      users/groups/deleteGroup.feature
      users/perimeters/deletePerimeter.feature