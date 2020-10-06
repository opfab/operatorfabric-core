#/bin/sh

# Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
# See AUTHORS.txt
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
# SPDX-License-Identifier: MPL-2.0
# This file is part of the OperatorFabric project.

rm -rf target

java -jar karate.jar                              \
      cards/cards.feature                         \
      cards/fetchArchivedCard.feature             \
      cards/fetchArchivedCardsWithParams.feature  \
      cards/getCardSubscription.feature           \
      cards/userCards.feature                     \
      cards/cardsUserAcks.feature                 \
      cards/cardsUserRead.feature                 \
      cards/userAcknowledgmentUpdateCheck.feature \
      cards/postCardWithNoProcess.feature         \
      cards/postCardWithNoState.feature           \
      cards/postCardFor3Users.feature             \
      cards/deleteCardFor3Users.feature           \
      cards/post2CardsInOneRequest.feature        \
      cards/post1CardThenUpdateThenDelete.feature \
      cards/getArchive.feature                    \
      cards/post2CardsGroupRouting.feature        \
      cards/post1BigCards.feature                 \
      cards/deleteUserCard.feature
      #cards/updateCardSubscription.feature
      #cards/delete3BigCards.feature               


