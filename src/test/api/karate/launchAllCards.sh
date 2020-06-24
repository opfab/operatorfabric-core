#/bin/sh


rm -rf target

java -jar karate.jar                              \
      cards/cards.feature                         \
      cards/fetchArchivedCard.feature             \
      cards/fetchArchivedCardsWithParams.feature  \
      cards/getCardSubscription.feature           \
      cards/userCards.feature                     \
      cards/cardsUserAcks.feature                 \
      cards/userAcknowledgmentUpdateCheck.feature \
      cards/postCardWithNoProcess.feature         \
      cards/postCardWithNoState.feature           \
      cards/postCardFor3Users.feature             \
      cards/deleteCardFor3Users.feature           \
      cards/post2CardsInOneRequest.feature        \
      cards/post1CardThenUpdateThenDelete.feature \
      cards/getArchive.feature                    \
      cards/post2CardsGroupRouting.feature        \
      cards/post1BigCards.feature                 
      #cards/updateCardSubscription.feature
      #cards/delete3BigCards.feature               


