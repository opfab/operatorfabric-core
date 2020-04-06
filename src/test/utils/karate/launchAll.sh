#/bin/sh

rm -rf target

java -jar karate.jar                                        \
      common/checkExpiredToken.feature                      \
      thirds/post2Bundles.feature                           \
      users/getGroupsAndUsers.feature                       \
      cards/post2CardsRouting.feature                       \
      cards/post6CardsSeverity.feature                      \
      cards/post4CardsSeverityAsync.feature                 \
      cards/post2CardsForEntities.feature                   \
      cards/post2CardsOnlyForEntities.feature               \
      cards/delete6CardsSeverity.feature                    \
      cards/post3BigCards.feature                           \
      cards/post3BigCardsAsync.feature                      \
      cards/delete3BigCards.feature                         \
      cards/postCardFor3Users.feature                       \
      cards/post1CardThenUpdateThenDelete.feature           \
      cards/post2CardsInOneRequest.feature                  \
      operatorfabric-getting-started/message1.feature       \
      operatorfabric-getting-started/message2.feature       \
      operatorfabric-getting-started/message_delete.feature \
      cards/getArchive.feature