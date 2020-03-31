#/bin/sh

rm -rf target

java -jar karate.jar                              \
      cards/cards.feature                         \
      cards/fetchArchivedCard.feature             \
      cards/fetchArchivedCardsWithParams.feature  \
      cards/getCardSubscription.feature           \
      #cards/updateCardSubscription.feature

